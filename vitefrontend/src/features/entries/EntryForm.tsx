import { useMemo, useState } from "react";
import type { Category } from "../../types/domain";
import Alert from "@mui/material/Alert";
import { createTimeEntry } from "../../api/timeEntries";
import {
  calculateDurationMinutes,
  formatDuration,
  formatTimeLabel,
  generateQuarterHourOptions,
  timeToMinutes,
} from "../../utils/time";

type EntryFormProps = {
  categories: Category[];
  selectedDate: string;
};

export function EntryForm({ categories, selectedDate }: EntryFormProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeOptions = useMemo(() => generateQuarterHourOptions(), []);
  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  const startMinutes = timeToMinutes(startTime);
  const isFormValid =
    description.trim().length > 0 && categoryId.length > 0 && durationMinutes > 0;
  const isAddDisabled = !isFormValid || isSubmitting;

  function clearError() {
    if (error) {
      setError(null);
    }
  }

  function handleStartTimeChange(value: string) {
    clearError();
    setStartTime(value);

    if (timeToMinutes(endTime) <= timeToMinutes(value)) {
      const nextEndMinutes = Math.min(timeToMinutes(value) + 15, 23 * 60 + 45);
      const nextEnd = timeOptions.find(
        (option) => timeToMinutes(option) === nextEndMinutes,
      );

      if (nextEnd) {
        setEndTime(nextEnd);
      }
    }
  }

  const handleAddEntry = async () => {
    setError(null);

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!categoryId) {
      setError("Category is required");
      return;
    }

    if (durationMinutes <= 0) {
      setError("End time must be after start time");
      return;
    }

    const startedAt = new Date(`${selectedDate}T${startTime}:00`).toISOString();

    try {
      setIsSubmitting(true);
      await createTimeEntry({
        categoryId,
        description: description.trim(),
        startedAt,
        durationMinutes,
      });

      setDescription("");
      setStartTime("09:00");
      setEndTime("10:00");
      setCategoryId(categories[0]?.id ?? "");
    } catch {
      setError("Could not add entry. Make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error ? (
        <Alert variant="filled" severity="error">
          {error}
        </Alert>
      ) : null}

      <form className="form-grid">
        <label>
          Description *
          <input
            value={description}
            placeholder="Deep Work - Keep it simple"
            onChange={(e) => {
              setDescription(e.target.value);
              clearError();
            }}
          />
        </label>

        <label>
          Category
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              clearError();
            }}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="time-range-grid">
          <label>
            Start
            <select
              value={startTime}
              onChange={(event) => handleStartTimeChange(event.target.value)}
            >
              {timeOptions.slice(0, -1).map((option) => (
                <option key={option} value={option}>
                  {formatTimeLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label>
          End
          <select
            value={endTime}
            onChange={(event) => {
              setEndTime(event.target.value);
              clearError();
            }}
          >
            {timeOptions.slice(1).map((option) => (
              <option
                  disabled={timeToMinutes(option) <= startMinutes}
                  key={option}
                  value={option}
                >
                  {formatTimeLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="duration-preview" aria-live="polite">
          Duration: <strong>{formatDuration(durationMinutes)}</strong>
        </div>
        <label>
          Notes
          <textarea className="duration-preview" placeholder="Links, Notes, " />
        </label>

        <button
          className="primary-button"
          type="button"
          onClick={handleAddEntry}
          disabled={isAddDisabled}
        >
          {isSubmitting ? "Adding..." : "Add Entry"}
        </button>
      </form>
    </div>
  );
}
