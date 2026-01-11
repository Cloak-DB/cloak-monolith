'use client';

import { useState, useRef } from 'react';
import { Button } from '@cloak-db/ui/components/button';
import { Input } from '@cloak-db/ui/components/input';
import { Card, CardContent } from '@cloak-db/ui/components/card';
import { Badge } from '@cloak-db/ui/components/badge';
import { Download, Sparkles, Moon, Sun } from 'lucide-react';
import { cn } from '@cloak-db/ui/lib/utils';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export default function OGGeneratorPage() {
  const [fileName, setFileName] = useState('home');
  const [pageNameEN, setPageNameEN] = useState('Cloak DB');
  const [descriptionEN, setDescriptionEN] = useState(
    'Production-Realistic Database Seeding for Development',
  );
  const [badge1EN, setBadge1EN] = useState('Open Source');
  const [badge2EN, setBadge2EN] = useState('Local-First');

  const [pageNameFR, setPageNameFR] = useState('Cloak DB');
  const [descriptionFR, setDescriptionFR] = useState(
    'Population Réaliste de Base de Données pour le Développement',
  );
  const [badge1FR, setBadge1FR] = useState('Open Source');
  const [badge2FR, setBadge2FR] = useState("Local d'abord");

  const [isDarkMode, setIsDarkMode] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const renderOGImage = async (
    pageName: string,
    description: string,
    badge1: string,
    badge2: string,
  ): Promise<string> => {
    if (!canvasRef.current) throw new Error('Canvas ref not available');

    const originalPageName =
      canvasRef.current.querySelector('[data-page-name]');
    const originalDescription =
      canvasRef.current.querySelector('[data-description]');
    const originalBadge1 = canvasRef.current.querySelector('[data-badge-1]');
    const originalBadge2 = canvasRef.current.querySelector('[data-badge-2]');

    if (
      originalPageName &&
      originalDescription &&
      originalBadge1 &&
      originalBadge2
    ) {
      originalPageName.textContent = pageName;
      originalDescription.textContent = description;
      originalBadge1.textContent = badge1;
      originalBadge2.textContent = badge2;
    }

    const { toPng } = await import('html-to-image');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const dataUrl = await toPng(canvasRef.current, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      pixelRatio: 1,
      backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
      cacheBust: true,
      skipFonts: true,
      style: {
        fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif',
      },
    });

    return dataUrl;
  };

  const downloadImages = async () => {
    try {
      await document.fonts.ready;

      const sanitizedFileName = fileName.toLowerCase().replace(/\s+/g, '-');

      const enDataUrl = await renderOGImage(
        pageNameEN,
        descriptionEN,
        badge1EN,
        badge2EN,
      );
      const enLink = document.createElement('a');
      enLink.download = `og-${sanitizedFileName}-en.png`;
      enLink.href = enDataUrl;
      enLink.click();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const frDataUrl = await renderOGImage(
        pageNameFR,
        descriptionFR,
        badge1FR,
        badge2FR,
      );
      const frLink = document.createElement('a');
      frLink.download = `og-${sanitizedFileName}-fr.png`;
      frLink.href = frDataUrl;
      frLink.click();

      await renderOGImage(pageNameEN, descriptionEN, badge1EN, badge2EN);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Error generating images. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white">
              OG Image Generator
            </h1>
            <span className="px-3 py-1 bg-orange-500 border-2 border-black dark:border-orange-500 text-white dark:text-orange-500 text-xs font-black uppercase">
              DEV ONLY
            </span>
          </div>
          <p className="text-base md:text-lg font-bold text-gray-600 dark:text-gray-400">
            Create Open Graph images (1200x630px) with Cloak DB neobrutalism
            design
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2 pb-4 border-b-2 border-black dark:border-white">
                  <label
                    htmlFor="file-name"
                    className="block text-sm font-bold text-black dark:text-white"
                  >
                    File Name
                  </label>
                  <Input
                    id="file-name"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g., home, docs, features"
                  />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    Will generate: og-
                    {fileName.toLowerCase().replace(/\s+/g, '-')}-en.png & og-
                    {fileName.toLowerCase().replace(/\s+/g, '-')}-fr.png
                  </p>
                </div>

                <div className="space-y-4 pb-4 border-b-2 border-black dark:border-white">
                  <h3 className="text-lg font-black text-black dark:text-white">
                    English Version
                  </h3>
                  <div className="space-y-2">
                    <label
                      htmlFor="page-name-en"
                      className="block text-sm font-bold text-black dark:text-white"
                    >
                      Page Name
                    </label>
                    <Input
                      id="page-name-en"
                      type="text"
                      value={pageNameEN}
                      onChange={(e) => setPageNameEN(e.target.value)}
                      placeholder="Enter page name (EN)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description-en"
                      className="block text-sm font-bold text-black dark:text-white"
                    >
                      Description
                    </label>
                    <textarea
                      id="description-en"
                      value={descriptionEN}
                      onChange={(e) => setDescriptionEN(e.target.value)}
                      placeholder="Enter description (EN)"
                      rows={3}
                      className={cn(
                        'flex w-full rounded-xl border-2 px-4 py-3',
                        'text-base text-black placeholder:text-gray-500 font-medium',
                        'bg-white',
                        'dark:bg-transparent dark:text-white dark:placeholder:text-gray-400 dark:border-white',
                        'focus-visible:outline-none focus-visible:ring-0',
                        'transition-all duration-100 ease-out',
                        'border-black shadow-offset focus-visible:shadow-[3px_3px_0px_theme(colors.black)] hover:shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-none dark:border-white',
                        'focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] hover:translate-x-[1px] hover:translate-y-[1px] dark:focus-visible:translate-x-0 dark:focus-visible:translate-y-0 dark:hover:translate-x-0 dark:hover:translate-y-0',
                        'resize-none',
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="badge1-en"
                        className="block text-sm font-bold text-black dark:text-white"
                      >
                        Badge 1
                      </label>
                      <Input
                        id="badge1-en"
                        type="text"
                        value={badge1EN}
                        onChange={(e) => setBadge1EN(e.target.value)}
                        placeholder="Badge 1 (EN)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="badge2-en"
                        className="block text-sm font-bold text-black dark:text-white"
                      >
                        Badge 2
                      </label>
                      <Input
                        id="badge2-en"
                        type="text"
                        value={badge2EN}
                        onChange={(e) => setBadge2EN(e.target.value)}
                        placeholder="Badge 2 (EN)"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black text-black dark:text-white">
                    Version Française
                  </h3>
                  <div className="space-y-2">
                    <label
                      htmlFor="page-name-fr"
                      className="block text-sm font-bold text-black dark:text-white"
                    >
                      Nom de la page
                    </label>
                    <Input
                      id="page-name-fr"
                      type="text"
                      value={pageNameFR}
                      onChange={(e) => setPageNameFR(e.target.value)}
                      placeholder="Entrer le nom de la page (FR)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description-fr"
                      className="block text-sm font-bold text-black dark:text-white"
                    >
                      Description
                    </label>
                    <textarea
                      id="description-fr"
                      value={descriptionFR}
                      onChange={(e) => setDescriptionFR(e.target.value)}
                      placeholder="Entrer la description (FR)"
                      rows={3}
                      className={cn(
                        'flex w-full rounded-xl border-2 px-4 py-3',
                        'text-base text-black placeholder:text-gray-500 font-medium',
                        'bg-white',
                        'dark:bg-transparent dark:text-white dark:placeholder:text-gray-400 dark:border-white',
                        'focus-visible:outline-none focus-visible:ring-0',
                        'transition-all duration-100 ease-out',
                        'border-black shadow-offset focus-visible:shadow-[3px_3px_0px_theme(colors.black)] hover:shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-none dark:border-white',
                        'focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] hover:translate-x-[1px] hover:translate-y-[1px] dark:focus-visible:translate-x-0 dark:focus-visible:translate-y-0 dark:hover:translate-x-0 dark:hover:translate-y-0',
                        'resize-none',
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="badge1-fr"
                        className="block text-sm font-bold text-black dark:text-white"
                      >
                        Badge 1
                      </label>
                      <Input
                        id="badge1-fr"
                        type="text"
                        value={badge1FR}
                        onChange={(e) => setBadge1FR(e.target.value)}
                        placeholder="Badge 1 (FR)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="badge2-fr"
                        className="block text-sm font-bold text-black dark:text-white"
                      >
                        Badge 2
                      </label>
                      <Input
                        id="badge2-fr"
                        type="text"
                        value={badge2FR}
                        onChange={(e) => setBadge2FR(e.target.value)}
                        placeholder="Badge 2 (FR)"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black dark:text-white">
                    OG Image Mode
                  </label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsDarkMode(false)}
                      variant={!isDarkMode ? 'yellow' : 'outline'}
                      className="flex-1 h-auto px-4 py-3 text-sm font-bold"
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      onClick={() => setIsDarkMode(true)}
                      variant={isDarkMode ? 'yellow' : 'outline'}
                      className="flex-1 h-auto px-4 py-3 text-sm font-bold"
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={downloadImages}
                  variant="yellow"
                  className="w-full h-auto px-6 py-4 text-base font-bold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Both Images (EN&nbsp;+&nbsp;FR)
                </Button>
              </CardContent>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-transparent border-blue-500">
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <h3 className="text-lg font-black text-black dark:text-white">
                    Usage Notes
                  </h3>
                </div>
                <ul className="text-sm font-bold text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                  <li>Standard OG image size: 1200x630px</li>
                  <li>Generates both EN and FR versions</li>
                  <li>Preview shows English version</li>
                  <li>Switch between light and dark modes</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-black dark:text-white">
                Preview
              </h2>
              <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">
                {OG_WIDTH}x{OG_HEIGHT}
              </span>
            </div>

            <div className="border-4 border-black dark:border-white shadow-[8px_8px_0px_theme(colors.black)] dark:shadow-none overflow-auto">
              <div
                ref={canvasRef}
                style={{
                  width: `${OG_WIDTH}px`,
                  height: `${OG_HEIGHT}px`,
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                }}
                className={cn(
                  'relative overflow-hidden',
                  isDarkMode
                    ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900'
                    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
                )}
              >
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '20%',
                    top: '30%',
                    width: '400px',
                    height: '400px',
                    background:
                      'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
                    filter: 'blur(40px)',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '70%',
                    top: '60%',
                    width: '500px',
                    height: '500px',
                    background:
                      'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 70%)',
                    filter: 'blur(40px)',
                    transform: 'translate(-50%, -50%)',
                  }}
                />

                <div
                  className="absolute top-0 left-0 rounded-full blur-3xl pointer-events-none"
                  style={{
                    width: '500px',
                    height: '500px',
                    opacity: isDarkMode ? '0.10' : '0.35',
                    background:
                      'linear-gradient(135deg, rgb(168, 85, 247), rgb(59, 130, 246))',
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 rounded-full blur-3xl pointer-events-none"
                  style={{
                    width: '600px',
                    height: '600px',
                    opacity: isDarkMode ? '0.10' : '0.35',
                    background:
                      'linear-gradient(135deg, rgb(251, 191, 36), rgb(251, 146, 60))',
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: isDarkMode ? '0.02' : '0.03',
                    backgroundImage:
                      'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    color: isDarkMode ? '#ffffff' : '#000000',
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between p-16">
                  <div className="space-y-4">
                    <Badge
                      variant="purple"
                      className={cn(
                        'px-6 py-3 text-2xl font-black rounded-none shadow-[4px_4px_0px_theme(colors.black)] whitespace-nowrap',
                        isDarkMode && 'shadow-none',
                      )}
                    >
                      CLOAK&nbsp;DB
                    </Badge>
                  </div>

                  <div className="space-y-6 max-w-3xl">
                    <h1
                      data-page-name
                      className="font-black leading-tight"
                      style={
                        {
                          fontSize: pageNameEN.length > 30 ? '64px' : '80px',
                          lineHeight: '1.05',
                          backgroundImage: isDarkMode
                            ? 'linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(216, 180, 254) 50%, rgb(191, 219, 254) 100%)'
                            : 'linear-gradient(90deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 50%, rgb(51, 65, 85) 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          MozBackgroundClip: 'text',
                          MozTextFillColor: 'transparent',
                        } as React.CSSProperties
                      }
                    >
                      {pageNameEN}
                    </h1>
                    <p
                      data-description
                      className="font-bold leading-snug"
                      style={{
                        fontSize: descriptionEN.length > 80 ? '28px' : '36px',
                        lineHeight: '1.2',
                        color: isDarkMode
                          ? 'rgb(229, 231, 235)'
                          : 'rgb(51, 65, 85)',
                      }}
                    >
                      {descriptionEN}
                    </p>
                  </div>

                  <div className="flex gap-4 items-center">
                    <Badge
                      variant="blue"
                      className={cn(
                        'px-6 py-3 text-xl font-bold rounded-none shadow-[4px_4px_0px_theme(colors.black)] inline-flex items-center justify-center',
                        isDarkMode && 'shadow-none',
                      )}
                    >
                      <span data-badge-1 style={{ display: 'inline-block' }}>
                        {badge1EN}
                      </span>
                    </Badge>
                    <Badge
                      variant="yellow"
                      className={cn(
                        'px-6 py-3 text-xl font-bold rounded-none shadow-[4px_4px_0px_theme(colors.black)] inline-flex items-center justify-center',
                        isDarkMode && 'shadow-none',
                      )}
                    >
                      <span data-badge-2 style={{ display: 'inline-block' }}>
                        {badge2EN}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center">
              Scroll right if preview is cut off on smaller screens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
