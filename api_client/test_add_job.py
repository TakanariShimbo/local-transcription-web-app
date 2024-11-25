import argparse
from typing import Literal

import requests


API_SERVER_ENDPOINT = "http://localhost:8000"


def add_job(
    audio_filepath: str,
    language: Literal["Japanese", "English"],
    priority: Literal["high", "low"],
) -> None:
    data = {
        "language": language,
        # "expiration_sec": 60 * 60 * 24,
    }

    with open(file=audio_filepath, mode="rb") as audio_file:
        audio_files = [("audio_files", audio_file)]

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
            print(f"{job_id}: submitted as {priority}-priority")
    else:
        raise Exception(f"Failed to submit job: {response.text}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Submit audio files for processing.")
    parser.add_argument("--audio", required=True, help="Path of the audio file")
    parser.add_argument("--language", choices=["Japanese", "English"], default="Japanese", help="Language of the audio files")

    audio_filepath = parser.parse_args().audio
    language = parser.parse_args().language

    add_job(audio_filepath=audio_filepath, language=language, priority="low")
