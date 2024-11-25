from typing import Any, Literal

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from scheme import AddJobResponse, GetResultResponse
from cache_clinet import CacheClient


cache_client = CacheClient()
app = FastAPI()

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def add_job_process(
    priority: Literal["high", "low"],
    language: str,
    expiration_sec: int,
    audio_files: list[UploadFile],
) -> dict[str, Any]:
    response_data = []

    for audio_file in audio_files:
        job_data_dict = {
            "language": language,
            "expiration_sec": expiration_sec,
            "audio_extension": audio_file.filename.split(sep=".")[-1],
            "audio_file": audio_file.file.read(),
        }

        if priority == "high":
            job_id = cache_client.add_high_priority_job(job_data_dict=job_data_dict)
        elif priority == "low":
            job_id = cache_client.add_low_priority_job(job_data_dict=job_data_dict)

        response_data.append({"job_id": job_id})
    return {"data": response_data}


def get_result_process(job_id: str) -> JSONResponse | dict[str, Any]:
    n_wait = cache_client.check_n_wait(job_id=job_id)
    if n_wait >= 0:
        return JSONResponse(
            status_code=202,
            content={
                "data": {"n_wait": n_wait},
            },
        )

    result = cache_client.get_result_data(job_id=job_id)
    if result:
        return {
            "data": {"transcription": result["transcription"]},
        }

    raise HTTPException(status_code=404, detail="Job not found")


def remove_result_process(job_id: str) -> None:
    if not cache_client.remove_result_data(job_id=job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    return


def cancel_job_process(job_id: str) -> None:
    is_success, message = cache_client.cancel_job(job_id=job_id)

    if message == "processing":
        raise HTTPException(status_code=400, detail="Job is processing")
    elif message == "not found":
        raise HTTPException(status_code=404, detail="Job not found")

    return


@app.post(path="/add-job/high-priority", response_model=AddJobResponse)
def add_job_as_high_priority(
    language: str = Form(...),
    expiration_sec: int = Form(60 * 60 * 24 * 7),
    audio_files: list[UploadFile] = File(...),
):
    return add_job_process(priority="high", language=language, expiration_sec=expiration_sec, audio_files=audio_files)


@app.post(path="/add-job/low-priority", response_model=AddJobResponse)
def add_job_as_low_priority(
    language: str = Form(...),
    expiration_sec: int = Form(60 * 60 * 24 * 7),
    audio_files: list[UploadFile] = File(...),
):
    return add_job_process(priority="low", language=language, expiration_sec=expiration_sec, audio_files=audio_files)


@app.get(path="/get-result/{job_id}", response_model=GetResultResponse)
def get_result(job_id: str):
    return get_result_process(job_id=job_id)


@app.delete(path="/remove-result/{job_id}")
def remove_result(job_id: str):
    remove_result_process(job_id=job_id)


@app.delete(path="/cancel-job/{job_id}")
def cancel_job(job_id: str):
    cancel_job_process(job_id=job_id)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app=app, host="0.0.0.0", port=8000)
