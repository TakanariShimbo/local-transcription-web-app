import time
import os
from typing import Any
import warnings

from cache_client import CacheClient
from transcriber import Transcriber

warnings.filterwarnings(action="ignore", category=FutureWarning)


def _transcriptioin_process(transcriber: Transcriber, job_data: dict[str, Any]) -> dict[str, Any]:
    language: str = job_data["language"]
    audio_extension: str = job_data["audio_extension"]
    audio_file: bytes = job_data["audio_file"]

    # save audio file
    audio_filepath = f"./temp/audio.{audio_extension}"
    with open(file=audio_filepath, mode="wb") as f:
        f.write(audio_file)

    # transcribe audio file
    transcription = transcriber.transcribe(audio_filepath=audio_filepath, language=language)

    # remove temp file
    os.remove(path=audio_filepath)

    result_data = {
        "transcription": transcription,
    }

    return result_data


def process_job(transcriber: Transcriber, job_id: str, job_data: dict[str, Any]) -> dict[str, Any]:
    result_data = _transcriptioin_process(transcriber=transcriber, job_data=job_data)
    print(f"Processing completed: {job_id}")
    return result_data


if __name__ == "__main__":
    cache_client = CacheClient()
    transcriber = Transcriber()

    while True:
        job = cache_client.search_job()
        if job is None:
            continue

        job_id, job_data = job
        result_data = process_job(transcriber=transcriber, job_id=job_id, job_data=job_data)

        cache_client.post_process_job(job_id=job_id, job_data=job_data, result_data=result_data)

        time.sleep(1)
