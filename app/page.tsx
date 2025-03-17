'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from './types';
import { mockApi } from './lib/api';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        // In a real app with backend, we'd use the real API function instead of mockApi
        const data = await mockApi.getProperties();
        setProperties(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Vibe Rentals</h1>
        <p className="text-center text-gray-600 mt-2">Find your perfect getaway</p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/add-property"
            className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
          >
            List Your Property
          </Link>
        </div>
      </header>

      <main>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Properties</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-pulse">Loading properties...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-500 text-center">
              {error}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link href={`/property/${property.id}`} key={property.id}>
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-48 w-full">
                      <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                        <span className="text-gray-500">Property Image</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <p className="text-gray-600">{property.location}</p>
                      <p className="font-medium mt-2">${property.price} / night</p>

                      <div className="mt-3">
                        <h4 className="text-sm font-medium">Amenities:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {property.amenities.slice(0, 3).map((amenity, i) => (
                            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              +{property.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p>No properties found. Be the first to list your property!</p>
              <Link
                href="/add-property"
                className="inline-block mt-4 bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
              >
                Add Your Property
              </Link>
            </div>
          )}
        </section>

        <section>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Have a place to rent?</h2>
            <p className="text-gray-600 mb-4">Share your space and start earning</p>
            <Link
              href="/add-property"
              className="inline-block bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
            >
              Become a Host
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
