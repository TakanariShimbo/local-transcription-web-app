import axios from "axios";

const API_SERVER_HOST = import.meta.env.VITE_API_SERVER_ADDRESS || "localhost";
const API_SERVER_PORT = import.meta.env.VITE_API_SERVER_PORT || 8000;
const API_SERVER_ENDPOINT = `http://${API_SERVER_HOST}:${API_SERVER_PORT}`;

export type TranscriptionResult = {
  status: "queued" | "completed" | "not_found";
  data?: { position?: number; text?: string };
};

export const checkTranscriptionResultDummy = async ({ uuid }: { uuid: string }): Promise<TranscriptionResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const random = Math.random();
  if (random < 0.3) {
    return { status: "queued", data: { position: Math.floor(Math.random() * 2) } };
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

export const checkTranscriptionResult = async ({ uuid }: { uuid: string }): Promise<TranscriptionResult> => {
  try {
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
    } else {
      throw new Error(`Failed to get job result: ${response.statusText}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        status: "not_found",
      };
    }
    throw error;
  }
};

export const addTranscriptionJobDummy = async ({ audio_file, language }: { audio_file: File; language: string }): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return crypto.randomUUID();
};

export const addTranscriptionJob = async ({ audio_file, language }: { audio_file: File; language: string }): Promise<string> => {
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

export const removeTranscriptionResultDummy = async ({ uuid }: { uuid: string }): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Dummy: Removed transcription result for UUID: ${uuid}`);
};

export const removeTranscriptionResult = async ({ uuid }: { uuid: string }): Promise<void> => {
  try {
    const response = await axios.delete(`${API_SERVER_ENDPOINT}/remove-result/${uuid}`);

    if (response.status !== 200) {
      throw new Error(`Failed to remove job result: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error removing transcription result: ${error}`);
    throw error;
  }
};

export const cancelTranscriptionJobDummy = async ({ uuid }: { uuid: string }): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Dummy: Cancelled transcription job for UUID: ${uuid}`);
};

export const cancelTranscriptionJob = async ({ uuid }: { uuid: string }): Promise<void> => {
  try {
    const response = await axios.delete(`${API_SERVER_ENDPOINT}/cancel-job/${uuid}`);

    if (response.status !== 200) {
      throw new Error(`Failed to cancel job: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error cancelling transcription job: ${error}`);
    throw error;
  }
};
