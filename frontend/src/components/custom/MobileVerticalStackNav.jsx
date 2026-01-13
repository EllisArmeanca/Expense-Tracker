import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mobile-friendly vertical stack navigation that appears on the right side
const MobileVerticalStackNav = ({ stackItems = [], trigger = null, sheetTitle = "Navigation", sheetDescription = "Quick navigation links" }) => {
  const navigate = useNavigate();

  const handleNavigation = (item) => {
    if (item.to) {
      navigate(item.to);
    } else if (item.onClick) {
      item.onClick();
    } else if (item.action === 'back') {
      navigate(-1);
    }
  };

  if (!stackItems || stackItems.length === 0) {
    return null;
  }

  const defaultTrigger = (
    <Button variant="outline" size="icon" className="rounded-full">
      <Icon icon="lucide:menu" className="h-4 w-4" />
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-16 p-2 flex flex-col items-center">
        <SheetHeader className="sr-only">
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {stackItems.map((item, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-accent"
                    onClick={() => handleNavigation(item)}
                    aria-label={item.label || 'Navigation item'}
                  >
                    {typeof item.icon === 'string' ? (
                      <Icon icon={item.icon} className="h-5 w-5" />
                    ) : (
                      item.icon
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileVerticalStackNav;