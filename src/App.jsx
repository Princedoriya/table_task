import './App.css'
import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Paginator } from 'primereact/paginator';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import { ChevronDown } from 'lucide-react';
import { Dialog } from 'primereact/dialog';

const API = "https://api.artic.edu/api/v1/artworks?page=1"

const App = () => {
  const [users, setUsers] = useState([]);
  const [rowClick, setRowClick] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
   const [showPopup, setShowPopup] = useState(false);
  const [inputValue, setInputValue] = useState('');


  const handleSubmit = async () => {
    const numRows = parseInt(inputValue, 10);
    if (!isNaN(numRows) && numRows > 0) {
      let accumulatedUsers = [];
      let page = 1;
      while (accumulatedUsers.length < numRows) {
        const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          accumulatedUsers = accumulatedUsers.concat(data.data);
          if (data.pagination?.total_pages && page >= data.pagination.total_pages) {
            break; //for:- no more pages
          }
          page++;
        } else {
          break; //for:- no more data
        }
      }
      const selected = accumulatedUsers.slice(0, numRows);
      setSelectedProducts(selected);
      //for: update users and pagination state to reflect the page containing last selected row
      setUsers(accumulatedUsers.slice(0, rows));
      setFirst(0);
    }
    setShowPopup(false);
    setInputValue('');
  };

  const fetchUsers = async (url) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setUsers(data.data);
        setTotalRecords(data.pagination?.total || 120);
      }
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  const onPageChange = (e) => {
    setFirst(e.first);
    setRows(e.rows);
    fetchUsers(`https://api.artic.edu/api/v1/artworks?page=${e.page + 1}`);
  }

  useEffect(() => {
    fetchUsers(API);
  }, [])

  return (
    <>
      <h1 className='text-3xl font-bold text-center my-4'>DataTable with Row Selection Task</h1>

      <div>
        <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />

        <DataTable value={users} selectionMode={rowClick ? undefined : 'checkbox'} selection={selectedProducts} 
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          dataKey="id"
          stripedRows
          showGridlines
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column selectionMode={rowClick ? 'single' : 'multiple'} headerStyle={{ width: '3rem' }}></Column>
          <Column field="title" header={() => {
            const handleChevronClick = () => {
              setShowPopup(true);
            };
            return (
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleChevronClick}>
                <ChevronDown size={25} style={{ marginRight: '0.5rem' }} />
                Title
              </div>
            );
          }}></Column>
          <Column field="place_of_origin" header="Place_of_origin"></Column>
          <Column field="artist_display" header="Artist_display"></Column>
          <Column field="inscriptions" header="Inscriptions"></Column>
          <Column field="date_start" header="Date_start"></Column>
          <Column field="date_end" header="Date_end"></Column>
        </DataTable>

        <Paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
        />

         <Dialog header="Select Rows" visible={showPopup} style={{ width: '350px' }} onHide={() => setShowPopup(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="select rows" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              style={{ padding: '0.5rem' }}
            />
            <button onClick={handleSubmit} style={{ padding: '0.5rem', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '4px' }}>
              Submit
            </button>
          </div>
        </Dialog>
      </div>
    </>
  )
}

export default App