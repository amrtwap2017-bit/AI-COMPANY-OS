To design a mobile-first field technician interface for a hotel engineering company using Next.js 16, we need to create several components that handle different parts of the workflow. Below is a high-level overview of the React component structure and the corresponding API calls required.

### Component Structure

1. **Technician Dashboard (`/operations/technicians/[id]/my-day`)**:
   - Displays today's work orders sorted by priority.
   - Each work order shows hotel, room, equipment, type, and status update buttons (Start, Complete, Need Parts).

2. **Work Order Execution Page**:
   - PM checklist (if PM type).
   - Photo capture using the camera API.
   - Parts used: search inventory items.
   - Notes/observations field.
   - Completion timestamp.

3. **Quick Parts Request**:
   - Search inventory.
   - If found, deduct from stock.
   - If not found, create an emergency PR with 'urgent' flag.

4. **Offline Consideration**:
   - Cache data locally (e.g., work orders, parts).
   - Sync data when connection is restored.

### API Calls

1. **Login and Authentication**:
   - `POST /api/auth/login`
     ```json
     {
       "username": "technician_id",
       "password": "password"
     }
     ```
   - Returns a token for authentication.

2. **Fetch Today's Work Orders**:
   - `GET /api/technicians/[id]/work-orders?date=today`
   - Returns work orders assigned to the technician for today, sorted by priority.

3. **Start Work Order**:
   - `POST /api/work-orders/[wo_id]/start`

4. **Complete Work Order**:
   - `POST /api/work-orders/[wo_id]/complete`
     ```json
     {
       "notes": "Completion notes",
       "photos": ["base64_image_data"],
       "parts_used": [
         { "part_id": 1, "quantity": 2 },
         { "part_id": 2, "quantity": 1 }
       ]
     }
     ```

5. **Search Inventory**:
   - `GET /api/inventory?query=part_name`
   - Returns inventory items matching the query.

6. **Deduct Parts from Stock**:
   - `POST /api/inventory/[part_id]/deduct`
     ```json
     {
       "quantity": 2
     }
     ```

7. **Create Emergency PR**:
   - `POST /api/prs`
     ```json
     {
       "parts": [
         { "part_id": 1, "quantity": 2 },
         { "part_id": 2, "quantity": 1 }
       ],
       "urgent": true,
       "notes": "Urgent parts request"
     }
     ```

### React Component Structure

#### Technician Dashboard (`/operations/technicians/[id]/my-day`)

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const TechnicianDashboard = ({ technicianId }) => {
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`/api/technicians/${technicianId}/work-orders?date=today`);
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const handleStatusUpdate = async (woId, status) => {
    try {
      if (status === 'Complete') {
        await axios.post(`/api/work-orders/${woId}/complete`, {
          notes: 'Completion notes',
          photos: ['base64_image_data'],
          parts_used: [
            { part_id: 1, quantity: 2 },
            { part_id: 2, quantity: 1 }
          ]
        });
      } else if (status === 'Need Parts') {
        // Handle parts request
      }
    } catch (error) {
      console.error('Error updating work order status:', error);
    }
  };

  return (
    <div>
      {workOrders.map(wo => (
        <div key={wo.id}>
          <h3>{wo.hotel} - Room {wo.room}</h3>
          <p>Equipment: {wo.equipment}, Type: {wo.type}</p>
          <button onClick={() => handleStatusUpdate(wo.id, 'Start')}>Start</button>
          <button onClick={() => handleStatusUpdate(wo.id, 'Complete')}>Complete</button>
          <button onClick={() => handleStatusUpdate(wo.id, 'Need Parts')}>Need Parts</button>
        </div>
      ))}
    </div>
  );
};

export default TechnicianDashboard;
```

#### Work Order Execution Page

```jsx
import { useState } from 'react';
import axios from 'axios';

const WorkOrderExecution = ({ woId }) => {
  const [partsUsed, setPartsUsed] = useState([]);
  const [notes, setNotes] = useState('');

  const handlePartSearch = async (query) => {
    try {
      const response = await axios.get(`/api/inventory?query=${query}`);
      // Handle search results
    } catch (error) {
      console.error('Error searching inventory:', error);
    }
  };

  const handlePartDeduct = async (partId, quantity) => {
    try {
      await axios.post(`/api/inventory/${partId}/deduct`, { quantity });
      setPartsUsed([...partsUsed, { part_id: partId, quantity }]);
    } catch (error) {
     