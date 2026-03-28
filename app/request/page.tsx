import { redirect } from "next/navigation";

export default function RequestRedirect({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    }
  });

  const queryString = params.toString();
  redirect(`/request/new${queryString ? `?${queryString}` : ''}`);
}
