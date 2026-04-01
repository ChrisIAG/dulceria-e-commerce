'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CouponFiltersProps {
  currentStatus?: string;
}

export function CouponFilters({ currentStatus }: CouponFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/admin/cupones?${params.toString()}`);
  };

  const filters = [
    { label: 'Todos', value: 'all' },
    { label: 'Activos', value: 'active' },
    { label: 'Expirados', value: 'expired' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive =
          (!currentStatus && filter.value === 'all') ||
          currentStatus === filter.value;

        return (
          <Button
            key={filter.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(filter.value)}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
