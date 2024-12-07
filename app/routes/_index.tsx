import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { Form } from "react-router-dom";

export const meta: MetaFunction = () => {
  return [
    { title: "Budget App" },
    { name: "description", content: "Your personal budget" },
  ];
};
export async function action({ request, context }: ActionFunction) {
  const adapter = new PrismaD1(context.cloudflare.env.DB);
  const prisma = new PrismaClient({ adapter });
  const form_data = await request.formData();
  if (request.method == "POST") {
    return await prisma.budget.create({
      data: { name: form_data.get("name") },
    });
  }

  if (request.method == "DELETE") {
    return await prisma.budget.delete({
      where: {
        id: parseInt(form_data.get("id")),
      },
    });
  }

  return { status: "none" };
}
export async function loader({ context }: LoaderFunctionArgs) {
  const adapter = new PrismaD1(context.cloudflare.env.DB);
  const prisma = new PrismaClient({ adapter })
  return await prisma.budget.findMany();
}
export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      budget app
      <Form method="POST">
        <input type="text" name="name" />
        <button type="submit">Create budget</button>
      </Form>
      {data.map((budget) => (
        <div key={`budget-${budget.id}`}>
          <Link to={`/budget/${budget.id}`}>{budget.name}</Link>
          <Form method="DELETE">
            <input type="hidden" name="id" value={budget.id} />
            <button type="submit">DELETE</button>
          </Form>
        </div>
      ))}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
