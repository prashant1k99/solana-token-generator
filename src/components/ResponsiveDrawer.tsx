import { useMediaQuery } from "@/hooks/use-media-query"
import { ReactNode, useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogContent,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
} from "./ui/drawer"

interface ResponsiveDrawerProps {
  title: string;
  children: ReactNode;
  description?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isProcessing?: boolean
}

export function ResponsiveDrawer({
  trigger,
  title,
  children,
  description,
  open: controlledOpen,
  onOpenChange,
  isProcessing = false
}: ResponsiveDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen


  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Edit</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {description && (
              <DialogDescription>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || <Button variant="outline">Edit</Button>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <DrawerDescription>
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-4">
          {children}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button disabled={isProcessing} variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
