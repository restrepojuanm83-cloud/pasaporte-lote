'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PasaporteContent() {
  const searchParams = useSearchParams();
  const lote = searchParams.get('lote');
  const coa = searchParams.get('coa');
  const tds = searchParams.get('tds');
  const sds = searchParams.get('sds');
  const tx = searchParams.get('tx');

  return (
    <main className="max-w-xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Pasaporte Digital RWA</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-100">
        <div>
          <span className="text-sm text-gray-500 block">Identificador de Lote</span>
          <strong className="text-lg text-gray-900">{lote || 'No especificado'}</strong>
        </div>

        <div>
          <span className="text-sm text-gray-500 block">Transacción en Blockchain (Stellar)</span>
          {tx ? (
            <a href={https://stellar.expert/explorer/testnet/tx/} target="_blank" className="text-blue-600 underline text-sm break-all">
              Ver en Stellar Expert
            </a>
          ) : 'No disponible'}
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-gray-700 mb-2">Tridente Documental (IPFS)</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              {coa ? <a href={https://gateway.pinata.cloud/ipfs/} target="_blank" className="text-blue-500 hover:underline">Certificado de Análisis (CoA)</a> : 'CoA no disponible'}
            </li>
            <li>
              {tds ? <a href={https://gateway.pinata.cloud/ipfs/} target="_blank" className="text-blue-500 hover:underline">Hoja de Datos Técnicos (TDS)</a> : 'TDS no disponible'}
            </li>
            <li>
              {sds ? <a href={https://gateway.pinata.cloud/ipfs/} target="_blank" className="text-blue-500 hover:underline">Hoja de Datos de Seguridad (SDS)</a> : 'SDS no disponible'}
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function PasaporteRWA() {
  return (
    <Suspense fallback={<div className="p-8">Cargando pasaporte...</div>}>
      <PasaporteContent />
    </Suspense>
  );
}
