import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const ctx = trpc.useContext();
  const postMessage = trpc.useMutation("guestbook.postMessage", {
    onMutate: () => {
      ctx.cancelQuery(["guestbook.getAll"]);
      const optimisticUpdate = ctx.getQueryData(["guestbook.getAll"]);

      if (optimisticUpdate) {
        ctx.setQueryData(["guestbook.getAll"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["guestbook.getAll"]);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    postMessage.mutate({
      name: session?.user?.name as string,
      message,
    });

    setMessage("");
  };

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }
  return (
    <main className="flex flex-col items-center">
      <h1 className="text-3xl pt-4">Guestbook</h1>
      <p>
        Tutorial for <code>create-t3-app</code>
      </p>

      {session ? (
        <div>
          <p>hi {session.user?.name}</p>

          <div className="pt-6">
            <form className="flex gap-3" onSubmit={onSubmit}>
              <input
                type="text"
                value={message}
                placeholder="your message..."
                onChange={(e) => setMessage(e.target.value)}
                className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
              >
                Submit
              </button>
            </form>
          </div>
          <div className="pt-10">
            <Messages />
          </div>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      ) : (
        <button onClick={() => signIn("discord")}>Login with Discord</button>
      )}
    </main>
  );
};

const Messages = () => {
  const { data: messages, isLoading } = trpc.useQuery(["guestbook.getAll"]);
  if (isLoading) return <div>Fetching messages...</div>;

  return (
    <div className="flex flex-col gap-4">
      {messages?.map((msg, index) => {
        return (
          <div key={index}>
            <p>{msg.massage}</p>
            <span>- {msg.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
