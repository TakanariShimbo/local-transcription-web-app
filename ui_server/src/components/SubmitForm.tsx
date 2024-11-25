import { useState } from "react";
import { useForm, Control } from "react-hook-form";
import { CheckCircle, AlertCircle, Copy, Loader } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { type SubmitFormValues, submitFormSchema } from "@/lib/schemas";
import { addTranscriptionJob } from "@/lib/api";

const AudioFileField = ({ control }: { control: Control<SubmitFormValues> }): JSX.Element => (
  <FormField
    control={control}
    name="audioFile"
    render={({ field: { onChange }, fieldState: { error } }) => (
      <FormItem>
        <Label htmlFor="audio">音声ファイル</Label>
        <FormControl>
          <Input
            id="audio"
            type="file"
            accept="audio/*, video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file);
              }
            }}
          />
        </FormControl>
        {error && <FormMessage>{error.message}</FormMessage>}
      </FormItem>
    )}
  />
);

const LanguageSelectField = ({ control }: { control: Control<SubmitFormValues> }): JSX.Element => (
  <FormField
    control={control}
    name="language"
    render={({ field }) => (
      <FormItem>
        <Label htmlFor="language">言語</Label>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="Japanese">日本語</SelectItem>
            <SelectItem value="English">英語</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }): JSX.Element => (
  <Button type="submit" className="w-full" disabled={isSubmitting}>
    {isSubmitting ? (
      <>
        <Loader className="mr-2 h-5 w-5 animate-spin" />
        送信中...
      </>
    ) : (
      "送信"
    )}
  </Button>
);

const UuidDisplay = ({ uuid, onCopy }: { uuid: string; onCopy: () => Promise<void> }): JSX.Element => (
  <div className="mt-4 p-4 bg-muted rounded-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm font-mono">
        <span className="font-bold">申請ID: </span>
        {uuid}
      </p>
      <Button type="button" onClick={onCopy} className="text-background">
        <Copy className="h-5 w-5" />
      </Button>
    </div>
  </div>
);

export const SubmitForm = (): JSX.Element => {
  const [uuid, setUuid] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitFormSchema),
  });

  const { isSubmitting } = form.formState;

  const showToast = ({ variant, title, description }: { variant: "success" | "error"; title: string; description: string }): void => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          {variant === "success" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
          {title}
        </div>
      ),
      description,
      variant: variant === "success" ? undefined : "destructive",
    });
  };

  const onSubmit = async ({ audioFile, language }: SubmitFormValues) => {
    try {
      const result = await addTranscriptionJob({ audio_file: audioFile, language: language });
      setUuid(result);
      showToast({ variant: "success", title: "申請完了", description: "リクエストが正常に送信されました。" });
    } catch (error) {
      showToast({ variant: "error", title: "エラー", description: "申請中にエラーが発生しました。" });
    }
  };

  const handleCopyUuid = async () => {
    await navigator.clipboard.writeText(uuid);
    showToast({ variant: "success", title: "コピー完了", description: "申請IDがクリップボードにコピーされました。" });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AudioFileField control={form.control} />
            <LanguageSelectField control={form.control} />
            <SubmitButton isSubmitting={isSubmitting} />
            {uuid && <UuidDisplay uuid={uuid} onCopy={handleCopyUuid} />}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
