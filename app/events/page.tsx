"use client";
import { useState } from "react";
import { Search, Calendar, Mic, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface IEvent {
  summary: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  id: string;
}

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();

  const formatToRFC3339 = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString();
  };

  const handleDateSearch = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    const formattedStartDate = formatToRFC3339(startDate);
    const formattedEndDate = formatToRFC3339(endDate);

    try {
      const res = await fetch(
        `/api/calendar/get?user_id=${session?.user.id}&start_time=${formattedStartDate}&end_time=${formattedEndDate}`
      );
      const data = await res.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventTime = (timeString: string) => {
    return format(parseISO(timeString), "MMM d, yyyy h:mm a");
  };

  const handleEventDeletion = async (event_id: string) => {
    try {
      const res = await fetch(
        `/api/calendar/delete?user_id=${session?.user.id}&event_id=${event_id}`
      );
      if (!res.ok) {
        toast.error(res.message || res.error);
      }
      setEvents(events.filter((event) => event.id != event_id));
      toast.success("Event Deleted Successfully");
    } catch (error) {
      toast.error(error);
      console.log("Error deleting event", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-8 w-full min-h-[88vh] flex flex-col gap-10 items-center pb-10 bg-gradient-to-br from-background to-secondary">
      <div className="w-full pt-10 flex justify-between items-center gap-10">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Events</h1>
          <p className="text-muted-foreground">Discover upcoming events</p>
        </div>
        <Card className="w-full">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col gap-6">
              {/* Date Range Selection */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 text-center">
                  Start
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1"
                    placeholder="Start date"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  End
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1"
                    placeholder="End date"
                  />
                </div>
                <Button
                  onClick={handleDateSearch}
                  disabled={isLoading || !startDate || !endDate}
                  className="w-full md:w-auto"
                >
                  {isLoading ? "Loading..." : "Find Events"}
                </Button>
              </div>

              {/* Search Input - Only shown when events are available */}
              {events.length > 0 && (
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow relative"
            >
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{event.summary}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="text-sm">
                      <p>Starts: {formatEventTime(event.start_time)}</p>
                      <p>Ends: {formatEventTime(event.end_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm">{event.location}</p>
                      <Trash2
                        className="absolute bottom-3 right-2 text-muted-foreground hover:text-red-500"
                        onClick={() => handleEventDeletion(event.id)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
