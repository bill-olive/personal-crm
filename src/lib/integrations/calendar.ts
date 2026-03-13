import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";

export interface CalendarEvent {
  id?: string | null;
  summary?: string;
  description?: string;
  start?: calendar_v3.Schema$EventDateTime;
  end?: calendar_v3.Schema$EventDateTime;
  attendees?: { email: string }[];
  status?: string;
  htmlLink?: string;
}

export interface FreeSlot {
  start: string;
  end: string;
}

export class CalendarConnector {
  private calendar: calendar_v3.Calendar;

  constructor(authClient: calendar_v3.Options["auth"]) {
    this.calendar = google.calendar({ version: "v3", auth: authClient });
  }

  /**
   * List events in a time range.
   */
  async listEvents(
    timeMin: string,
    timeMax: string,
    query?: string,
    calendarId = "primary"
  ): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        q: query ?? undefined,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items ?? [];
      return events.map((e) => ({
        id: e.id,
        summary: e.summary ?? undefined,
        description: e.description ?? undefined,
        start: e.start,
        end: e.end,
        attendees: e.attendees?.map((a) => ({ email: a.email ?? "" })),
        status: e.status ?? undefined,
        htmlLink: e.htmlLink ?? undefined,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list events";
      throw new Error(`Calendar listEvents failed: ${message}`);
    }
  }

  /**
   * Get a single event by ID.
   */
  async getEvent(eventId: string, calendarId = "primary"): Promise<CalendarEvent | null> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      const e = response.data;
      if (!e.id) return null;

      return {
        id: e.id,
        summary: e.summary ?? undefined,
        description: e.description ?? undefined,
        start: e.start,
        end: e.end,
        attendees: e.attendees?.map((a) => ({ email: a.email ?? "" })),
        status: e.status ?? undefined,
        htmlLink: e.htmlLink ?? undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get event";
      throw new Error(`Calendar getEvent failed: ${message}`);
    }
  }

  /**
   * Create a new event.
   */
  async createEvent(
    summary: string,
    start: string,
    end: string,
    attendees: string[],
    description?: string,
    calendarId = "primary"
  ): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: {
          summary,
          description: description ?? undefined,
          start: { dateTime: start, timeZone: "UTC" },
          end: { dateTime: end, timeZone: "UTC" },
          attendees: attendees.map((email) => ({ email })),
        },
      });

      const e = response.data;
      if (!e.id) throw new Error("No event ID returned from create");

      return {
        id: e.id,
        summary: e.summary ?? undefined,
        description: e.description ?? undefined,
        start: e.start,
        end: e.end,
        attendees: e.attendees?.map((a) => ({ email: a.email ?? "" })),
        status: e.status ?? undefined,
        htmlLink: e.htmlLink ?? undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event";
      throw new Error(`Calendar createEvent failed: ${message}`);
    }
  }

  /**
   * Update an existing event.
   */
  async updateEvent(
    eventId: string,
    updates: Partial<{
      summary: string;
      description: string;
      start: string;
      end: string;
      attendees: string[];
    }>,
    calendarId = "primary"
  ): Promise<CalendarEvent> {
    try {
      const body: calendar_v3.Schema$Event = {};
      if (updates.summary !== undefined) body.summary = updates.summary;
      if (updates.description !== undefined) body.description = updates.description;
      if (updates.start !== undefined)
        body.start = { dateTime: updates.start, timeZone: "UTC" };
      if (updates.end !== undefined)
        body.end = { dateTime: updates.end, timeZone: "UTC" };
      if (updates.attendees !== undefined)
        body.attendees = updates.attendees.map((email) => ({ email }));

      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        requestBody: body,
      });

      const e = response.data;
      if (!e.id) throw new Error("No event ID returned from update");

      return {
        id: e.id,
        summary: e.summary ?? undefined,
        description: e.description ?? undefined,
        start: e.start,
        end: e.end,
        attendees: e.attendees?.map((a) => ({ email: a.email ?? "" })),
        status: e.status ?? undefined,
        htmlLink: e.htmlLink ?? undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update event";
      throw new Error(`Calendar updateEvent failed: ${message}`);
    }
  }

  /**
   * Find free time slots for given attendees within a date range.
   */
  async findFreeSlots(
    attendeeEmails: string[],
    durationMinutes: number,
    dateRange: { start: string; end: string },
    calendarId = "primary"
  ): Promise<FreeSlot[]> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: dateRange.start,
          timeMax: dateRange.end,
          items: [
            { id: calendarId },
            ...attendeeEmails.map((email) => ({ id: email })),
          ],
        },
      });

      const calendars = response.data.calendars ?? {};
      const busyPeriods: { start: string; end: string }[] = [];

      for (const cal of Object.values(calendars)) {
        const busy = cal.busy ?? [];
        for (const b of busy) {
          if (b.start && b.end) {
            busyPeriods.push({ start: b.start, end: b.end });
          }
        }
      }

      busyPeriods.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      const merged: { start: string; end: string }[] = [];
      for (const period of busyPeriods) {
        const last = merged[merged.length - 1];
        if (last && new Date(period.start) <= new Date(last.end)) {
          if (new Date(period.end) > new Date(last.end)) {
            last.end = period.end;
          }
        } else {
          merged.push({ ...period });
        }
      }

      const rangeStart = new Date(dateRange.start);
      const rangeEnd = new Date(dateRange.end);
      const durationMs = durationMinutes * 60 * 1000;
      const freeSlots: FreeSlot[] = [];

      let current = rangeStart.getTime();
      let busyIdx = 0;

      while (current + durationMs <= rangeEnd.getTime()) {
        const slotEnd = new Date(current + durationMs);
        const slotEndTime = slotEnd.getTime();

        while (busyIdx < merged.length && new Date(merged[busyIdx].end).getTime() <= current) {
          busyIdx++;
        }

        const nextBusy = merged[busyIdx];
        const nextBusyStart = nextBusy ? new Date(nextBusy.start).getTime() : Infinity;

        if (slotEndTime <= nextBusyStart) {
          freeSlots.push({
            start: new Date(current).toISOString(),
            end: slotEnd.toISOString(),
          });
          current = slotEndTime;
        } else {
          current = new Date(nextBusy!.end).getTime();
        }
      }

      return freeSlots;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to find free slots";
      throw new Error(`Calendar findFreeSlots failed: ${message}`);
    }
  }
}
