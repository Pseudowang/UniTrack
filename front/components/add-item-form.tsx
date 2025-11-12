"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import { useToast } from "@/hooks/use-toast"

export function AddItemForm() {
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Uniqlo URL or product code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: value.trim() }),
      })

      const data = await response.json()

      if (response.status === 201) {
        toast({
          title: "Success",
          description: data.message === "already-tracking" ? "Already tracking this item" : "Item added successfully",
        })
        setValue("")
      } else if (response.status === 409) {
        toast({
          title: "Already Tracking",
          description: "This item is already in your tracked list",
        })
        setValue("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add item",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <InputGroup className="flex-1">
        <Input
          placeholder="https://www.uniqlo.com/... or product code"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
        />
      </InputGroup>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Item"}
      </Button>
    </form>
  )
}
