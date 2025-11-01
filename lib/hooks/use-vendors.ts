import { useQuery } from '@tanstack/react-query'
import { api } from '../api/mockClient'
import type { Vendor, Filter } from '../../../types'

export function useVendors(filters?: Filter) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      const response = await api.getVendors(filters)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const response = await api.getVendorById(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

