import { Form } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Home | Lemore" },
    { name: "description", content: "Welcome to Lemore" },
  ];
};

export default function HomePage() {
  return (
    <div>
      <div className="flex flex-col py-15 items-center justify-center rounded-md bg-gradient-to-t from-background to-primary/10">
        <h1 className="text-4xl font-bold">Buy Less, Share More, Live Lighter - in ChiangMai</h1>
      </div>
      <Form className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2">
        <Input name="query" type="text" placeholder="Search for items or cities" />
        <Button type="submit" variant="outline">Search</Button>
      </Form>
    </div>
  );
}