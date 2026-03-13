import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    notFound();
  }

  async function deleteContact() {
    "use server";
    await prisma.contact.delete({ where: { id } });
    redirect("/");
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/"
        className="text-indigo-600 hover:text-indigo-800 text-sm mb-4 inline-block"
      >
        &larr; Back to Contacts
      </Link>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-4">{contact.name}</h1>
        <dl className="space-y-3">
          {contact.email && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">
                Email
              </dt>
              <dd className="text-gray-900">{contact.email}</dd>
            </div>
          )}
          {contact.phone && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">
                Phone
              </dt>
              <dd className="text-gray-900">{contact.phone}</dd>
            </div>
          )}
          {contact.company && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">
                Company
              </dt>
              <dd className="text-gray-900">{contact.company}</dd>
            </div>
          )}
          {contact.notes && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">
                Notes
              </dt>
              <dd className="text-gray-900 whitespace-pre-wrap">
                {contact.notes}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase">
              Added
            </dt>
            <dd className="text-gray-900">
              {new Date(contact.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <form action={deleteContact}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Contact
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
