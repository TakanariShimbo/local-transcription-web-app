import axios from "axios";

const API_SERVER_HOST = import.meta.env.VITE_API_SERVER_ADDRESS || "localhost";
const API_SERVER_PORT = import.meta.env.VITE_API_SERVER_PORT || 8000;
const API_SERVER_ENDPOINT = `http://${API_SERVER_HOST}:${API_SERVER_PORT}`;

export type TranscriptionResult = {
  status: "queued" | "completed" | "not_found";
  data?: { position?: number; text?: string };
};

export const checkTranscriptionStatusDummy = async ({ uuid }: { uuid: string }): Promise<TranscriptionResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const random = Math.random();
  if (random < 0.3) {
    return { status: "queued", data: { position: Math.floor(Math.random() * 10) + 1 } };
  } else if (random < 0.6) {
    return {
      status: "completed",
      data: {
        text: "これは文字起こしの結果のサンプルテキストです。実際のAPIでは、音声ファイルから変換されたテキストが表示されます。これは文字起こしの結果のサンプルテキストです。実際のAPIでは、音声ファイルから変換されたテキストが表示されます。これは文字起こしの結果のサンプルテキストです。実際のAPIでは、音声ファイルから変換されたテキストが表示されます。",
      },
    };
  } else {
    return { status: "not_found" };
  }
};

export const checkTranscriptionStatus = async ({ uuid }: { uuid: string }): Promise<TranscriptionResult> => {
  const response = await axios.get(`${API_SERVER_ENDPOINT}/get-result/${uuid}`);

  if (response.status === 200) {
    return {
      status: "completed",
      data: {
        text: response.data.data.transcription,
      },
    };
  } else if (response.status === 202) {
    const position = response.data.data.n_wait;
    return {
      status: "queued",
      data: {
        position,
      },
    };
  } else if (response.status === 404) {
    return {
      status: "not_found",
    };
  } else {
    throw new Error(`Failed to get job result: ${response.statusText}`);
  }
};

export const submitTranscriptionRequestDummy = async ({ audio_file, language }: { audio_file: File; language: string }): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return crypto.randomUUID();
};

export const submitTranscriptionRequest = async ({ audio_file, language }: { audio_file: File; language: string }): Promise<string> => {
  const formData = new FormData();
  formData.append("language", language);
  formData.append("audio_files", audio_file);

  const response = await axios.post(`${API_SERVER_ENDPOINT}/add-job/low-priority`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to submit transcription request: ${response.statusText}`);
  }

  return response.data.data[0].job_id;
};
