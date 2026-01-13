import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, Bell, Calendar, Check, ChevronDown, Copy, CreditCard, Plus, Settings, User } from 'lucide-react';
import { toast } from 'sonner';
import NavigationStackDemo from './NavigationStackDemo';
import ExpenseBudgetBoxDemo from './ExpenseBudgetBoxDemo';
import FilterMenuDemo from './FilterMenuDemo';
import TagPieChartDemo from './TagPieChartDemo';
import ExpenditureIncomeChartDemo from './ExpenditureIncomeChartDemo';
import HorizontalNavigationStackDemo from './HorizontalNavigationStackDemo';

const Components = () => {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(66);

  const triggerToast = () => {
    toast.success('This is a toast notification!');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Component Playground</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Settings className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Different badge variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Different input types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about yourself..." />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Different alert types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components to your app using the cli.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>User avatars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Checkbox */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox</CardTitle>
            <CardDescription>Toggle selections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={checkboxChecked}
                onCheckedChange={setCheckboxChecked}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms and conditions
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Switch */}
        <Card>
          <CardHeader>
            <CardTitle>Switch</CardTitle>
            <CardDescription>Toggle switch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="airplane-mode">Airplane Mode</Label>
              <Switch
                id="airplane-mode"
                checked={switchChecked}
                onCheckedChange={setSwitchChecked}
              />
            </div>
          </CardContent>
        </Card>

        {/* Radio Group */}
        <Card>
          <CardHeader>
            <CardTitle>Radio Group</CardTitle>
            <CardDescription>Single selection</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={radioValue} onValueChange={setRadioValue} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="option1" />
                <Label htmlFor="option1">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="option2" />
                <Label htmlFor="option2">Option 2</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Select */}
        <Card>
          <CardHeader>
            <CardTitle>Select</CardTitle>
            <CardDescription>Dropdown selector</CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Slider */}
        <Card>
          <CardHeader>
            <CardTitle>Slider</CardTitle>
            <CardDescription>Range selector</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              step={1}
            />
            <div className="text-center text-lg font-semibold">
              Value: {sliderValue[0]}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressValue} className="w-full" />
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>-</Button>
              <span className="text-center font-semibold">{progressValue}%</span>
              <Button variant="secondary" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>+</Button>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton</CardTitle>
            <CardDescription>Loading states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Separator */}
        <Card>
          <CardHeader>
            <CardTitle>Separator</CardTitle>
            <CardDescription>Dividers</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-xs text-muted-foreground">Section 1</div>
              <Separator className="my-2" />
              <div className="text-xs text-muted-foreground">Section 2</div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Tab navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                Make changes to your account here.
              </TabsContent>
              <TabsContent value="password">
                Change your password here.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accordion */}
        <Card>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>Expandable sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that match the other components' aesthetic.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>Context menus</CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Open menu <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Modal popups</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a dialog component example.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>This is the dialog content area.</p>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Alert Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Dialog</CardTitle>
            <CardDescription>Destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Show Alert</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Toast */}
        <Card>
          <CardHeader>
            <CardTitle>Toast</CardTitle>
            <CardDescription>Notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={triggerToast}>Show Toast</Button>
          </CardContent>
        </Card>

        {/* Navigation Stack Demo */}
        <div className="col-span-full">
          <NavigationStackDemo />
        </div>

        {/* Expense/Budget Box Demo */}
        <div className="col-span-full">
          <ExpenseBudgetBoxDemo />
        </div>

        {/* Filter Menu Demo */}
        <div className="col-span-full">
          <FilterMenuDemo />
        </div>

        {/* Tag Pie Chart Demo */}
        <div className="col-span-full">
          <TagPieChartDemo />
        </div>

        {/* Expenditure vs Income Chart Demo */}
        <div className="col-span-full">
          <ExpenditureIncomeChartDemo />
        </div>

        {/* Horizontal Navigation Stack Demo */}
        <div className="col-span-full">
          <HorizontalNavigationStackDemo />
        </div>

      </div>
    </div>
  );
};

export default Components;