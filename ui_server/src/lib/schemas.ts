import * as z from "zod";

export const submitFormSchema = z.object({
  audioFile: z
    .instanceof(File, { message: "音声ファイルを選択してください" })
    .refine((file) => file.size <= 1000 * 1024 * 1024, "ファイルサイズは1GB以下にしてください"),
  language: z.string({ required_error: "言語を選択してください" }).min(1, "言語を選択してください"),
});

export const resultFormSchema = z.object({
  uuid: z.string({ required_error: "UUIDを入力してください" }).min(1, "UUIDを入力してください").uuid("有効なUUIDを入力してください"),
});

export type SubmitFormValues = z.infer<typeof submitFormSchema>;
export type ResultFormValues = z.infer<typeof resultFormSchema>;
