import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>
      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No contacts yet.</p>
          <Link
            href="/contacts/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add your first contact
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{contact.name}</h2>
                  <div className="text-sm text-gray-500 mt-1 space-x-3">
                    {contact.email && <span>{contact.email}</span>}
                    {contact.company && (
                      <span className="text-indigo-500">
                        {contact.company}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
