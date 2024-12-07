
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

import { useLoaderData, Link, Form } from "@remix-run/react";
export async function action({ request, context }) {
  const adapter = new PrismaD1(context.cloudflare.env.DB);
  const prisma = new PrismaClient({adapter});
  const form_data = await request.formData();
  if (request.method == "POST") {
    return await prisma.expense.create({
      data: {
        name: form_data.get("name"),
        amount: parseFloat(form_data.get("amount")),
        type: form_data.get("type"),
        budget: {
          connect: {
            id: parseInt(form_data.get("budget_id"))
          }
        }
      }
    })
  }
  return { "status": "none"}
}
export async function loader({ params, context }) {

  const adapter = new PrismaD1(context.cloudflare.env.DB);
  const prisma = new PrismaClient({ adapter });

  return await prisma.budget.findUnique({
    where: { id : parseInt(params.budget_id)},
    include: {expenses: true }
  });
}

export default function BudgetPage() {
  const data = useLoaderData<typeof loader>();
  return (<div>budget page
    <Form method="POST">
      <input type="hidden" name="budget_id" value={data.id} />
      <input type="text" name="name" placeholder="name" />
      <input type="number" name="amount" placeholder="amount" />
      <select name="type">
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>
      <button type="submit">Create entry</button>
    </Form>
    <pre>{JSON.stringify(data,null,2)}</pre>
  </div>);
}
