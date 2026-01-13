import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const VerticalStackNav = ({ stackItems = [] }) => {
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

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center space-y-2 p-2 bg-muted rounded-lg">
        {stackItems.map((item, index) => (
          <Tooltip key={index}>
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
        ))}
      </div>
    </TooltipProvider>
  );
};

export default VerticalStackNav;