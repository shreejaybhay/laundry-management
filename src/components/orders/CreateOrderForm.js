"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateOrderForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    serviceId: "",
    weight: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="service">Service</label>
        <select
          id="service"
          value={formData.serviceId}
          onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option value="">Select a service</option>
          <option value="1">Wash & Fold</option>
          <option value="2">Dry Cleaning</option>
          <option value="3">Ironing</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="weight">Weight (kg)</label>
        <Input
          id="weight"
          type="number"
          min="0.1"
          step="0.1"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          placeholder="Enter weight in kg"
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Add any special instructions"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Order</Button>
      </div>
    </form>
  );
}