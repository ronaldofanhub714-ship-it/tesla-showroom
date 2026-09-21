 import Image from 'next/image';
  import Link from 'next/link';
  import { supabase } from '@/lib/supabase';

  export const revalidate = 0; // disable ISR for demo

  export default async function Home() {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, model, msrp_cents, image_url')
      .eq('inventory_status', 'available');

    if (error) console.error('vehicles fetch error', error);

    return (
      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4">Invest • Trade • Drive</h1>

        <nav className="flex gap-4 mb-6">
          <Link href="/invest">Invest</Link>
          <Link href="/trade">Trade</Link>
          <Link href="/drive">Drive</Link>
        </nav>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Featured Vehicles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles?.map((v) => (
              <Link key={v.id} href={`/drive/${v.id}`} className="group">
                <div className="rounded overflow-hidden shadow-lg p-2 bg-gray-100">
                  <Image
                    src={v.image_url}
                    alt={v.model}
                    width={200}
                    height={150}
                    className="object-cover w-full h-full"
                  />
                  <h3 className="mt-1 text-lg font-medium">{v.model}</h3>
                  <p className="text-sm">₹{(v.msrp_cents / 100).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    );
  }
