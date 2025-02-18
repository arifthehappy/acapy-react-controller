import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "./components/Navigation";
import { ConnectionsList } from "./components/ConnectionsList";
import { CredentialsList } from "./components/CredentialsList";
import { ProofsList } from "./components/ProofsList";
import { SchemasList } from "./components/schemas/SchemasList";
import { CredentialDefinitionsList } from "./components/credentialDefinitions/credentialDefinitionList";
import { DelegationPage } from "./components/delegation/DelegationPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/connections" element={<ConnectionsList />} />
              <Route path="/credentials" element={<CredentialsList />} />
              <Route path="/proofs" element={<ProofsList />} />
              <Route path="/schemas" element={<SchemasList />} />
              <Route
                path="/credential-definitions"
                element={<CredentialDefinitionsList />}
              />
              <Route path="/delegation" element={<DelegationPage />} />
              <Route path="/" element={<ConnectionsList />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
