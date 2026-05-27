import type { Metadata } from "next";

import { AddChildForm } from "@/components/features/tracker/add-child-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { PageHeader } from "@/components/primitives/page-header";
import { ADD_CHILD_COPY } from "@/config/tracker";
import { requireServerSession } from "@/lib/server-session";

export const metadata: Metadata = {
  title: ADD_CHILD_COPY.metaTitle,
};

export const dynamic = "force-dynamic";

export default async function AddChildPage() {
  await requireServerSession();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={ADD_CHILD_COPY.eyebrow}
        title={ADD_CHILD_COPY.title}
        description={ADD_CHILD_COPY.description}
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{ADD_CHILD_COPY.title}</CardTitle>
          <CardDescription>{ADD_CHILD_COPY.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AddChildForm />
        </CardContent>
      </Card>
    </div>
  );
}
