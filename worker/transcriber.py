from whisper import load_model, transcribe


class Transcriber:
    def __init__(self, model_name: str = "large-v3", model_dir: str = "./model") -> None:
        self.model = load_model(model_name, device="cuda", download_root=model_dir)

    def transcribe(self, audio_filepath: str, language: str) -> str:
        result = transcribe(
            self.model,
            audio_filepath,
            language=language,
            verbose=False,
            temperature=0.0,
            condition_on_previous_text=False,
            word_timestamps=True,
        )

        transcription = ""
        for segment in result["segments"]:
            segment_start = segment["start"]
            segment_end = segment["end"]
            segment_text = segment["text"]

            # Format as [hh:mm:ss.sss --> hh:mm:ss.sss] Text
            transcription += f"[{segment_start:0>8.3f} --> {segment_end:0>8.3f}] {segment_text}\n"

        if len(transcription) > 0:
            transcription = transcription[:-1]

        return transcription
