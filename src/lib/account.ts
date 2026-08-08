import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./catalog";

export type Profile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

/** The signed-in user's profile row. */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name, phone, avatar_url")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile) ?? null;
    },
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId!, ...values })
        .eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

/** Wishlist rows joined with their product. */
export function useWishlist(userId: string | undefined) {
  return useQuery({
    queryKey: ["wishlist", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id, products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => (row as unknown as { products: Product | null }).products)
        .filter(Boolean) as Product[];
    },
  });
}

export function useToggleWishlist(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, active }: { productId: string; active: boolean }) => {
      if (active) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", userId!)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: userId!, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist", userId] }),
  });
}

export type OrderRow = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  city: string;
  country: string;
  order_items: { id: string; title: string; quantity: number; price: number | null }[];
};

export function useOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["orders", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, status, city, country, order_items(id, title, quantity, price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });
}

export type SupportMessage = {
  id: string;
  sender: "user" | "agent";
  body: string;
  created_at: string;
};

export function useSupportMessages(userId: string | undefined) {
  return useQuery({
    queryKey: ["support-messages", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<SupportMessage[]> => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("id, sender, body, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SupportMessage[];
    },
  });
}
