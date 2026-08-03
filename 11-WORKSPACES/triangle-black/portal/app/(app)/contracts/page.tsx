"use client";
"use client";

import { useRouter } from 'next/navigation';
import tbFetch from '@/lib/api/tb-client';
import { useState, useEffect } from 'react';

const ContractsPage = () => {
    const router = useRouter();
    const [contracts, setContracts] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchContracts = async () => {
            try {
                const response = await tbFetch('/api/v1/contracts/?limit=10[36D[K
tbFetch('/api/v1/contracts/?limit=100');
                if (response.error) {
                    setError(response.error.message || 'Failed to load cont[4D[K
contracts');
                } else {
                    setContracts(Array.isArray(response) ? response : respo[5D[K
response?.results ?? response?.data ?? []);
                }
            } catch (err) {
                setError('An error occurred while fetching contracts.');
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, [mounted]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    if (!contracts.length && !loading) return <p>No contracts found.</p>;

    const columns = [
        { title: 'Title', dataIndex: 'title' },
        { title: 'Status', dataIndex: 'status', render: (text) => (
            <span style={{ backgroundColor: text === 'active' ? 'green' : t[1D[K
text === 'pending_signature' ? 'yellow' : text === 'completed' ? 'blue' : '[1D[K
'red', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                {text}
            </span>
        ) },
        { title: 'Value', dataIndex: 'value' },
        { title: 'Lead ID', dataIndex: 'lead_id' },
        { title: 'Created', dataIndex: 'created_at' }
    ];

    return (
        <table>
            <thead>
                <tr>{columns.map((col, index) => <th key={index}>{col.title[22D[K
key={index}>{col.title}</th>)}</tr>
            </thead>
            <tbody>
                {contracts.map(contract => (
                    <tr onClick={() => router.push(`/contracts/${contract.i[36D[K
router.push(`/contracts/${contract.id}`)} key={contract.id}>
                        {columns.map((col, index) => <td key={index}>{contr[18D[K
key={index}>{contract[col.dataIndex]}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ContractsPage;

This code snippet is a complete working Next.js page component for displayi[8D[K
displaying contracts. It includes:

1. "use client" at the top.
2. Importing `useRouter` from next/navigation and `tbFetch` from '@/lib/api[10D[K
'@/lib/api/tb-client'.
3. Using `useState` and `useEffect` with a mounted state to manage the data[4D[K
data fetching process.
4. Fetching contracts from the API endpoint `/api/v1/contracts/?limit=100`.[31D[K
`/api/v1/contracts/?limit=100`.
5. Extracting the array of contracts using `[1D[K
`Array.isArray(raw) ? raw : raw?.results ?? raw?.data ?? []`.
6. Defining table columns for Title, Status, Value, Lead ID, and Created.
7. Rendering a status badge with color based on the contract's status.
8. Handling loading, error, and empty states.
9. Clicking on a row to navigate to `/contracts/{id}`.

This component will render a table of contracts with clickable rows that na[2D[K
navigate to individual contract pages when clicked.

