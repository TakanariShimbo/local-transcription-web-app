from io import BufferedReader
import time

from typing import Literal

import requests


API_SERVER_ENDPOINT = "http://localhost:8000"


def submit_job(audio_files: list[tuple[str, BufferedReader]], priority: Literal["high", "low"]) -> list[str]:
    data = {
        "language": "Japanese",
        # "expiration_sec": 60 * 60 * 24,
    }

    response = requests.post(
        url=f"{API_SERVER_ENDPOINT}/add-job/{priority}-priority",
        data=data,
        files=audio_files,
    )

    if response.status_code == 200:
        job_ids = []
        body = response.json()
        for data in body["data"]:
            job_id = data["job_id"]
            job_ids.append(job_id)
            print(f"{job_id}: submitted to {priority}")
        return job_ids
    else:
        raise Exception(f"Failed to submit job: {response.text}")


def request_result(job_id: str):
    response = requests.get(
        url=f"{API_SERVER_ENDPOINT}/get-result/{job_id}",
    )

    body = response.json()
    if response.status_code == 200:
        print(f"{job_id}: Finish, result is {body['data']['transcription']}")
        return body["data"]["transcription"]
    elif response.status_code == 202:
        n_wait = body["data"]["n_wait"]
        print(f"{job_id}: Wait {n_wait}")
        return None
    else:
        raise Exception(f"Failed to get job result: {response.text}")


def observe_submited_job(job_id):
    while True:
        time.sleep(2.5)
        embdedding = request_result(job_id=job_id)
        if embdedding is not None:
            break


if __name__ == "__main__":
    audio_filepaths = [
        "input/sample.mp4",
        "input/sample.mp3",
    ]

    audio_files = [("audio_files", open(file=audio_filepath, mode="rb")) for audio_filepath in audio_filepaths]

    job_ids = submit_job(audio_files=audio_files, priority="low")

    for job_id in job_ids:
        observe_submited_job(job_id=job_id)
