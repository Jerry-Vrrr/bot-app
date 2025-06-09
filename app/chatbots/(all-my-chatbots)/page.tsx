import { Home } from "@/components/chatbots/home/Home";

export const dynamic = "force-dynamic";

export default async function Page() {
    // const response = await fetch(`${baseUrl}/api/chatbot-creator`, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" },
    //   });
    //   const data = await response.json();
    return (
        // <ForgetPassword />
        <Home />
    );
}
