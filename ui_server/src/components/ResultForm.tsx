import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader, Copy, AlertCircle, CheckCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { type ResultFormValues, resultFormSchema } from "@/lib/schemas";
import { type TranscriptionResult, checkTranscriptionStatus } from "@/lib/api";

const CompletedResult = ({ text, onCopy }: { text: string; onCopy: (text: string) => void }): JSX.Element => {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-green-100 text-foreground">
        <AlertDescription>文字起こしが完了しました。</AlertDescription>
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

const QueuedResult = ({ position }: { position: number }): JSX.Element => {
  return (
    <Alert className="bg-yellow-100 text-foreground">
      <AlertDescription>
        {position === 0 ? "現在文字お越し中です。もう少しで完了します。" : `現在順番待ちです。あなたの順番は ${position} 番目です。`}
      </AlertDescription>
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

const ResultDisplay = ({ result, handleCopyText }: { result: TranscriptionResult | null; handleCopyText: (text: string) => Promise<void> }) => (
  <div className="mt-6 space-y-4">
    {result?.status === "queued" && result.data?.position !== undefined && <QueuedResult position={result.data.position} />}
    {result?.status === "completed" && result.data?.text && <CompletedResult text={result.data.text} onCopy={handleCopyText} />}
    {result?.status === "not_found" && <NotFoundResult />}
  </div>
);

export const ResultForm = (): JSX.Element => {
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const { toast } = useToast();

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
  });

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

  const onSubmit = async (values: ResultFormValues) => {
    try {
      const response = await checkTranscriptionStatus({ uuid: values.uuid });
      setResult(response);
    } catch (error) {
      showToast({ variant: "error", title: "エラー", description: "ステータス確認中にエラーが発生しました。" });
    }
  };

  const handleCopyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToast({ variant: "success", title: "コピー完了", description: "文字起こし結果をクリップボードにコピーしました。" });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <FormComponent form={form} onSubmit={onSubmit} />
        <ResultDisplay result={result} handleCopyText={handleCopyText} />
      </CardContent>
    </Card>
  );
};
