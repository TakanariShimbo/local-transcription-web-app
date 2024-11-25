import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitForm } from "@/components/SubmitForm";
import { ResultForm } from "@/components/ResultForm";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">文字起こしアプリ</h1>

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="submit">申請</TabsTrigger>
            <TabsTrigger value="result">結果</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <SubmitForm />
          </TabsContent>

          <TabsContent value="result">
            <ResultForm />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
