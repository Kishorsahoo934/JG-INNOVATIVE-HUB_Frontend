import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Calendar, Settings, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

export function UserMenuDropdown({ className = '' }: { className?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'My Account';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className={`gap-1.5 rounded-full px-4 font-medium cursor-pointer shadow-sm hover:shadow transition-all ${className}`}>
            <User className="w-4 h-4" />
            <span className="truncate max-w-[110px]">{displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1.5 z-50 shadow-xl border-border bg-card">
          <DropdownMenuLabel className="font-normal px-2 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">{user?.name || 'Customer'}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          
          <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
            <Link to="/account" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
              <User className="w-4 h-4 text-primary" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
            <Link to="/account?tab=orders" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
              <Package className="w-4 h-4 text-blue-500" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
            <Link to="/wishlist" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Wishlist</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
            <Link to="/account?tab=addresses" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Saved Addresses</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
            <Link to="/account?tab=sessions" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>My Sessions</span>
            </Link>
          </DropdownMenuItem>

          {user?.role === 'tutor' && (
            <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
              <Link to="/tutor-dashboard" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
                <LayoutDashboard className="w-4 h-4 text-purple-500" />
                <span>Tutor Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-accent">
            <Link to="/account?tab=settings" className="flex items-center gap-2.5 px-2 py-2 text-xs sm:text-sm font-medium">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem 
            onSelect={(e) => { e.preventDefault(); setShowLogoutAlert(true); }}
            className="cursor-pointer rounded-md text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <div className="flex items-center gap-2.5 px-2 py-1.5 w-full text-xs sm:text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account, orders, and wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

