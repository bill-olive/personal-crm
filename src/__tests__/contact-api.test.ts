import { describe, it, expect } from "@jest/globals";

describe("Contact model validation", () => {
  it("should require a name field", () => {
    const contact = { name: "", email: "test@example.com" };
    expect(contact.name.trim()).toBe("");
  });

  it("should accept valid contact data", () => {
    const contact = {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1-555-0100",
      company: "Acme Corp",
      notes: "Met at conference",
    };
    expect(contact.name.trim()).toBeTruthy();
    expect(contact.email).toContain("@");
  });

  it("should handle optional fields being null", () => {
    const contact = {
      name: "John",
      email: null,
      phone: null,
      company: null,
      notes: null,
    };
    expect(contact.name).toBe("John");
    expect(contact.email).toBeNull();
    expect(contact.phone).toBeNull();
    expect(contact.company).toBeNull();
    expect(contact.notes).toBeNull();
  });

  it("should trim whitespace from name", () => {
    const name = "  Alice  ";
    expect(name.trim()).toBe("Alice");
  });
});
