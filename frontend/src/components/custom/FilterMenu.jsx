import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

const FilterMenu = ({
  title = "Filter Options",
  description = "Apply filters to customize your view",
  triggerText = "Open Filters",
  onApplyFilters = () => {},
  children,
  getTags = null,  // Function to fetch tags from the API
  staticCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Housing', 'Education', 'Other']
}) => {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [filters, setFilters] = useState({
    category: '',
    minAmount: '',
    maxAmount: '',
    includeTags: [],
    excludeTags: []
  });
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load tags when component mounts (if getTags function provided)
  useEffect(() => {
    if (getTags) {
      loadTags();
    } else {
      // Use some default tags as fallback
      setAllTags(['Groceries', 'Travel', 'Utilities', 'Entertainment', 'Dining', 'Shopping', 'Personal', 'Gift', 'Luxury', 'Unplanned', 'Business', 'Other']);
    }
  }, [getTags]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const tags = await getTags();
      if (Array.isArray(tags)) {
        // Assuming tags could be objects with {id, name} or just strings
        const tagNames = tags.map(tag => typeof tag === 'string' ? tag : tag.name || tag.label || '');
        setAllTags(tagNames);
      } else {
        setAllTags([]);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      // Fallback to default tags
      setAllTags(['Groceries', 'Travel', 'Utilities', 'Entertainment', 'Dining', 'Shopping', 'Personal', 'Gift', 'Luxury', 'Unplanned', 'Business', 'Other']);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApplyFilters({ ...filters, dateRange });
  };

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setFilters({
      category: '',
      minAmount: '',
      maxAmount: '',
      includeTags: [],
      excludeTags: []
    });
  };

  // Split tags into two groups for "include" and "exclude" sections
  const halfWay = Math.ceil(allTags.length / 2);
  const includeTags = allTags.slice(0, halfWay);
  const excludeTags = allTags.slice(halfWay);

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading filters...
      </Button>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          {triggerText}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {staticCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="space-y-3">
              <Label>Amount Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minAmount">Min</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAmount">Max</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    placeholder="∞"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label>Date Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? `${dateRange.from.toLocaleDateString()}` : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({...dateRange, from: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? `${dateRange.to.toLocaleDateString()}` : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({...dateRange, to: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tag Filters - Included */}
            <div className="space-y-3">
              <Label>Included Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                {includeTags.map((tag) => (
                  <div key={`include-${tag}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`include-${tag}`}
                      checked={filters.includeTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        const newIncludeTags = checked
                          ? [...filters.includeTags, tag]
                          : filters.includeTags.filter(t => t !== tag);
                        setFilters({...filters, includeTags: newIncludeTags});
                      }}
                    />
                    <label htmlFor={`include-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tag Filters - Excluded */}
            <div className="space-y-3">
              <Label>Excluded Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                {excludeTags.map((tag) => (
                  <div key={`exclude-${tag}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exclude-${tag}`}
                      checked={filters.excludeTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        const newExcludeTags = checked
                          ? [...filters.excludeTags, tag]
                          : filters.excludeTags.filter(t => t !== tag);
                        setFilters({...filters, excludeTags: newExcludeTags});
                      }}
                    />
                    <label htmlFor={`exclude-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Children props for additional custom filters */}
            {children && (
              <>
                <Separator />
                <div className="space-y-3">
                  {children}
                </div>
              </>
            )}
          </div>
          <DrawerFooter className="pt-4">
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Reset
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
            </div>
            <DrawerClose asChild>
              <Button variant="secondary" className="mt-2">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterMenu;