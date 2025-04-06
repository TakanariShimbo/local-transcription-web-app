import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader, Copy, Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type ResultFormValues, resultFormSchema } from "@/lib/schemas";
import { type TranscriptionResult, checkTranscriptionResult, removeTranscriptionResult, cancelTranscriptionJob } from "@/lib/api";

const DialogTrashButton = ({
  title,
  description,
  buttonText,
  onConfirm,
}: {
  title: string;
  description: string;
  buttonText: string;
  onConfirm: () => Promise<void>;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" className="flex-shrink-0 text-background">
          <Trash className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center space-x-4">
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              {buttonText}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              閉じる
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CompletedResult = ({
  text,
  onCopy,
  onRemove,
}: {
  text: string;
  onCopy: (text: string) => void;
  onRemove: () => Promise<void>;
}): JSX.Element => {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-green-100 text-foreground p-6">
        <div className="flex justify-between items-center gap-4">
          <AlertDescription>文字起こしが完了しました。</AlertDescription>
          <DialogTrashButton title="結果の削除" description="本当に文字起こし結果を履歴から削除しますか？" buttonText="削除" onConfirm={onRemove} />
        </div>
      </Alert>
      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start gap-4">
            <p className="whitespace-pre-wrap flex-grow">{text}</p>
            <Button type="button" className="flex-shrink-0 text-background" onClick={() => onCopy(text)}>
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QueuedResult = ({ position, onCancel }: { position: number; onCancel: () => Promise<void> }): JSX.Element => {
  return (
    <Alert className="bg-yellow-100 text-foreground">
      {position === 0 ? (
        <AlertDescription>現在文字起こし中です。もう少しで完了します。</AlertDescription>
      ) : (
        <div className="flex justify-between items-center gap-4">
          <AlertDescription>現在順番待ちです。あなたの順番は {position} 番目です。</AlertDescription>
          <DialogTrashButton
            title="予約のキャンセル"
            description="本当に文字起こし予約をキャンセルしますか？"
            buttonText="キャンセル"
            onConfirm={onCancel}
          />
        </div>
      )}
    </Alert>
  );
};

const NotFoundResult = (): JSX.Element => {
  return (
    <Alert variant="destructive" className="bg-red-100 text-foreground">
      <AlertDescription>指定された申請IDは見つかりませんでした。</AlertDescription>
    </Alert>
  );
};

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
  <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
    {isSubmitting ? (
      <>
        <Loader className="mr-2 h-4 w-4 animate-spin" />
        確認中...
      </>
    ) : (
      "確認"
    )}
  </Button>
);

const FormComponent = ({ form, onSubmit }: { form: any; onSubmit: (values: ResultFormValues) => Promise<void> }) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="uuid"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="uuid">申請ID</Label>
            <FormControl>
              <Input {...field} placeholder="文字起こしリクエストの申請IDを入力" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <SubmitButton isSubmitting={form.formState.isSubmitting} />
    </form>
  </Form>
);

const ResultDisplay = ({
  result,
  handleCopyText,
  handleRemoveResult,
  handleCancelJob,
}: {
  result: TranscriptionResult | null;
  handleCopyText: (text: string) => Promise<void>;
  handleRemoveResult: () => Promise<void>;
  handleCancelJob: () => Promise<void>;
}) => (
  <div className="mt-6 space-y-4">
    {result?.status === "queued" && result.data?.position !== undefined && (
      <QueuedResult position={result.data.position} onCancel={handleCancelJob} />
    )}
    {result?.status === "completed" && result.data?.text && (
      <CompletedResult text={result.data.text} onCopy={handleCopyText} onRemove={handleRemoveResult} />
    )}
    {result?.status === "not_found" && <NotFoundResult />}
  </div>
);

const copyTextLegacy = async (text: string): Promise<boolean> => {
  if (navigator?.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Modern clipboard API でのコピーに失敗:", error);
      return false;
    }
  }

  const textArea = document.createElement("textarea");
  textArea.readOnly = true;
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);

  textArea.value = text;
  textArea.select();
  textArea.setSelectionRange(0, text.length);

  let success = false;
  try {
    success = document.execCommand("copy");
    if (!success) {
      console.warn("document.execCommand('copy') が失敗しました。");
    }
  } catch (err) {
    console.error("フォールバックでのコピーに失敗:", err);
  } finally {
    document.body.removeChild(textArea);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }

  return success;
};

export const ResultForm = (): JSX.Element => {
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [submittedValues, setSubmittedValues] = useState<ResultFormValues | null>(null);
  const { toast } = useToast();

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
  });

  const showToast = ({ variant, title, description }: { variant: "success" | "error"; title: string; description: string }): void => {
    const iconEmoji = variant === "success" ? "✅" : "❌";
    toast({
      title: `${iconEmoji} ${title}`,
      description,
      variant: variant === "success" ? undefined : "destructive",
    });
  };

  const onSubmit = async (values: ResultFormValues) => {
    try {
      const response = await checkTranscriptionResult({ uuid: values.uuid });
      setSubmittedValues(values);
      setResult(response);
    } catch (error) {
      showToast({ variant: "error", title: "エラー", description: "ステータス確認中にエラーが発生しました。" });
    }
  };

  const handleCopyText = async (text: string) => {
    const success = await copyTextLegacy(text);
    if (success) {
      showToast({
        variant: "success",
        title: "コピー完了",
        description: "文字起こし結果をクリップボードにコピーしました。",
      });
    } else {
      showToast({
        variant: "error",
        title: "コピー失敗",
        description: "クリップボードへのコピーに失敗しました。",
      });
    }
  };

  const handleRemoveResult = async () => {
    if (!submittedValues) return;
    try {
      await removeTranscriptionResult({ uuid: submittedValues.uuid });
      showToast({ variant: "success", title: "削除完了", description: "文字起こし結果を削除しました。" });
    } catch (error) {
      showToast({ variant: "error", title: "エラー", description: "結果の削除中にエラーが発生しました。" });
    }
  };

  const handleCancelJob = async () => {
    if (!submittedValues) return;
    try {
      await cancelTranscriptionJob({ uuid: submittedValues.uuid });
      showToast({ variant: "success", title: "キャンセル完了", description: "文字起こし予約をキャンセルしました。" });
    } catch (error) {
      showToast({ variant: "error", title: "エラー", description: "予約のキャンセル中にエラーが発生しました。" });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <FormComponent form={form} onSubmit={onSubmit} />
        <ResultDisplay result={result} handleCopyText={handleCopyText} handleRemoveResult={handleRemoveResult} handleCancelJob={handleCancelJob} />
      </CardContent>
    </Card>
  );
};
