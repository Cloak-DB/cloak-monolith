'use client';

import { Button } from '@cloak/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@cloak/ui/components/card';
import { Badge } from '@cloak/ui/components/badge';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@cloak/ui/components/alert';
import { Input } from '@cloak/ui/components/input';
import { Select } from '@cloak/ui/components/select';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from '@cloak/ui/components/modal';
import { ToastProvider, useToast } from '@cloak/ui/components/toast';
import { Banner } from '@cloak/ui/components/banner';
import { useState } from 'react';

function DesignSystemContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Design System</h1>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Yellow', class: 'bg-yellow-500' },
            { name: 'Blue', class: 'bg-blue-500' },
            { name: 'Orange', class: 'bg-orange-500' },
            { name: 'Purple', class: 'bg-purple-500' },
            { name: 'Green', class: 'bg-green-500' },
            { name: 'Red', class: 'bg-red-500' },
          ].map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className={`${color.class} h-20 rounded-lg border-2 border-black dark:border-white`}
              />
              <p className="text-sm font-medium">{color.name}-500</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1 - Epilogue Bold</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              font-display, text-4xl
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Heading 2 - Epilogue Bold</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              font-display, text-3xl
            </p>
          </div>
          <div>
            <p className="text-base">Body text - Epilogue Regular</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              font-sans, text-base
            </p>
          </div>
          <div>
            <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              Code - Lexend Mega
            </code>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              font-mono
            </p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Buttons (from @cloak/ui)</h2>
        <div className="space-y-6">
          {/* Variants */}
          <div>
            <h3 className="font-bold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="yellow">Yellow</Button>
              <Button variant="blue">Blue</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-bold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>

          {/* States */}
          <div>
            <h3 className="font-bold mb-3">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Cards (from @cloak/ui)</h2>
        <div className="space-y-6">
          {/* Default Cards */}
          <div>
            <h3 className="font-bold mb-3">Card Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>
                    Card with shadow offset in light mode, transparent in dark
                    mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here</p>
                </CardContent>
              </Card>
              <Card className="dark:shadow-none">
                <CardHeader>
                  <CardTitle>Card without Shadow in Dark</CardTitle>
                  <CardDescription>
                    Using className to remove shadow in dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>More card content</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Borders & Shadows */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Borders & Shadows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Border Styles</h3>
            <div className="space-y-3">
              <div className="p-4 border border-black dark:border-white rounded-lg">
                border (1px)
              </div>
              <div className="p-4 border-2 border-black dark:border-white rounded-lg">
                border-2 (2px) - Default
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-3">Shadow Offset</h3>
            <div className="p-6 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-gray-950 shadow-offset dark:shadow-none">
              <p>
                The signature offset shadow creates depth and visual interest
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Badges (from @cloak/ui)</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="yellow">Yellow</Badge>
          <Badge variant="blue">Blue</Badge>
          <Badge variant="green">Green</Badge>
          <Badge variant="red">Red</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      {/* Banners */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Banners (from @cloak/ui)</h2>
        <div className="space-y-6">
          {/* Variants */}
          <div>
            <h3 className="font-bold mb-3">Variants</h3>
            <div className="space-y-4">
              <Banner variant="default">Default Banner</Banner>
              <Banner variant="yellow">Yellow Banner</Banner>
              <Banner variant="orange">Orange Banner</Banner>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-bold mb-3">Sizes</h3>
            <div className="space-y-4">
              <Banner size="sm">Small Banner</Banner>
              <Banner size="md">Medium Banner</Banner>
              <Banner size="lg">Large Banner</Banner>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Alerts (from @cloak/ui)</h2>
        <div className="space-y-4">
          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>This is a warning alert</AlertDescription>
          </Alert>
          <Alert variant="info">
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>This is an info alert</AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>This is a success alert</AlertDescription>
          </Alert>
          <Alert variant="error">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>This is an error alert</AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Form Elements */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Form Elements (from @cloak/ui)
        </h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block font-medium mb-2">Input Field</label>
            <Input type="text" placeholder="Enter text..." />
          </div>
          <div>
            <label className="block font-medium mb-2">Input with Error</label>
            <Input
              type="text"
              placeholder="Enter text..."
              error
              errorMessage="This field is required"
              id="error-input"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Select Field</label>
            <Select>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-2">Select with Error</label>
            <Select
              error
              errorMessage="Please select an option"
              id="error-select"
            >
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </Select>
          </div>
        </div>
      </section>

      {/* Modal & Toast */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Modal & Toast (from @cloak/ui)
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Button
            variant="blue"
            onClick={() => toast.success('Success message!')}
          >
            Show Success Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error('Error message!')}
          >
            Show Error Toast
          </Button>
          <Button onClick={() => toast.warning('Warning message!')}>
            Show Warning Toast
          </Button>
          <Button variant="blue" onClick={() => toast.info('Info message!')}>
            Show Info Toast
          </Button>
        </div>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
            <ModalDescription>
              This is a modal from the @cloak/ui package with dark mode support.
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <p>
              Modal content goes here. This demonstrates the modal component
              with transparent background in dark mode.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </section>
    </main>
  );
}

export function DesignSystemClient() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}
