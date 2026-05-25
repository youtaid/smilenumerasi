
import React, { useState } from 'react';
import KokurikulerInput from './KokurikulerInput';
import KokurikulerResult from './KokurikulerResult';
import { KokurikulerFormData, DocumentType, SchoolType, GamificationAction } from '../types';
import { generateKokurikulerDocument } from '../services/geminiService';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header Skeleton */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 p-8 space-y-6 overflow-hidden">
        {/* Title Area */}
        <div className="space-y-3 mx-auto max-w-2xl text-center mb-10">
           <div className="h-8 w-3/4 bg-slate-200 rounded-md mx-auto animate-pulse"></div>
           <div className="h-6 w-1/2 bg-slate-200 rounded-md mx-auto animate-pulse"></div>
        </div>

        {/* Paragraphs */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Table/Section */}
        <div className="max-w-3xl mx-auto mt-8 p-4 border border-slate-100 rounded-lg space-y-3">
           <div className="h-5 w-1/3 bg-slate-200 rounded animate-pulse mb-4"></div>
           <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
           <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
           <div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse"></div>
        </div>

         <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-11/12 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Footer Skeleton */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-center">
         <div className="h-3 w-64 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

interface KokurikulerToolProps {
    onAwardXP?: (action: GamificationAction) => void;
}

const KokurikulerTool: React.FC<KokurikulerToolProps> = ({ onAwardXP }) => {
  const [formData, setFormData] = useState<KokurikulerFormData>({
    schoolName: '',
    schoolType: SchoolType.UMUM,
    documentType: DocumentType.PROGRAM,
    academicYear: '2026/2027',
    headmaster: '',
    coordinator: '',
    theme: '',
    activityName: '',
    targetAudience: '',
    date: '',
    venue: '',
    frequency: '',
    activityCategory: '',
    generalGoal: '',
    specificGoal: '',
    successIndicators: '',
    flow: '',
    resources: '',
    attachmentDescription: '',
    paiElement: '', // Initialize Madrasah specific field
    notes: ''
  });

  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null); // Clear previous content to trigger skeleton mode

    try {
      const content = await generateKokurikulerDocument(formData);
      setGeneratedContent(content);
      if (onAwardXP) onAwardXP(GamificationAction.CREATE_KOKURIKULER);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedContent(null);
    setError(null);
  };

  // Determine if we should show the split view (result/skeleton visible)
  const showResultArea = generatedContent !== null || isLoading;

  return (
    <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className={`transition-all duration-500 ease-in-out ${
            showResultArea 
              ? 'lg:col-span-5' 
              : 'lg:col-span-8 lg:col-start-3'
          }`}>
             {/* Mobile Back Button */}
             {generatedContent && (
               <div className="lg:hidden mb-4 animate-fade-in">
                 <button onClick={handleReset} className="text-indigo-600 font-medium text-sm flex items-center gap-1">
                   ← Kembali ke Edit Data
                 </button>
               </div>
             )}

            <KokurikulerInput 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm animate-fade-in">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Right Column: Result or Skeleton */}
          {showResultArea && (
            <div className="lg:col-span-7 h-auto lg:h-[calc(100vh-12rem)] sticky top-24 animate-fade-in">
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <KokurikulerResult content={generatedContent!} onReset={handleReset} />
              )}
            </div>
          )}
        </div>
    </div>
  );
};

export default KokurikulerTool;
