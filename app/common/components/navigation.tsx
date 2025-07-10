import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from 'react-router';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from './ui/navigation-menu';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BarChart3Icon, BellIcon, LogOutIcon, MenuIcon, MessageCircleIcon, SettingsIcon, UserIcon, MapPin, ChevronDown, HeartIcon } from 'lucide-react';
import { LOCATIONS } from '~/constants';
import { NotificationsPage } from '../../features/users/pages/notifications-page';

const menus = [
  {
    name: 'Secondhand',
    to: '/secondhand',
    items: [
      {
        name: 'Browse Listings',
        description: 'Find great deals on used items',
        to: '/secondhand/browse-listings',
      },
      {
        name: 'Submit a Listing',
        description: 'Sell your stuff. Make some cash',
        to: '/secondhand/submit-a-listing',
      },
    ],
  },
  {
    name: 'Community',
    to: '/community',
    items: [
      {
        name: 'Local Tips',
        description: 'Share your local tips',
        to: '/community/local-tips',
      },
      {
        name: 'Local Reviews ',
        description: 'Share your local reviews',
        to: '/community/local-reviews',
      },
      {
        name: 'Give & Glow',
        description: 'One-line notes from your giving moments',
        to: '/community/give-and-glow',
      },
    ],
  },
  {
    name: 'Let Go Buddy',
    to: '/let-go-buddy',
  }
];

export function Navigation({
  isLoggedIn,
  hasNotifications,
  hasMessages,
  username,
  avatarUrl,
}: {
  isLoggedIn: boolean;
  hasNotifications: boolean;
  hasMessages: boolean;
  username: string;
  avatarUrl: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") || "Bangkok");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    const params = new URLSearchParams(searchParams);
    params.set("location", newLocation);
    setSearchParams(params);
  };

  useEffect(() => {
    const urlLocation = searchParams.get("location");
    if (urlLocation && urlLocation !== location) {
      setLocation(urlLocation);
    }
  }, [searchParams, location]);

  return (
    <nav className="flex items-center justify-between px-5 h-16 bg-primary fixed top-0 left-0 right-0 z-50">
      {/* 왼쪽 메뉴 */}
      <div className="flex-1 flex items-left gap-4">
      {/* 모바일 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="md:hidden">
            <button className="text-2xl cursor-pointer"><MenuIcon /></button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30">
          {menus.map((menu, idx) => (
            <div key={idx}>
              <DropdownMenuLabel className="text-sm text-neutral-800">
                {menu.to ? (
                  <Link to={menu.to} className="hover:underline">{menu.name}</Link>
                ) : menu.name}
              </DropdownMenuLabel>
              {menu.items && menu.items.map((item, subIdx) => (
                <DropdownMenuItem asChild key={subIdx} className="pl-6 text-xs text-neutral-700">
                  <Link to={item.to} className="block w-full">{item.name}</Link>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
          {isLoggedIn && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-sm text-neutral-800"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <BellIcon className="size-4 mr-2" />알림
                {hasNotifications && (
                  <div className="ml-auto size-2 bg-red-500 rounded-full" />
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {menus.map((menu) => (
            <NavigationMenuItem key={menu.name}>
              {menu.items? ( 
                <> 
                <Link to={menu.to}>
                  <NavigationMenuTrigger> {menu.name} </NavigationMenuTrigger>
                </Link>
                <NavigationMenuContent> 
                  <ul className="grid w-[400px] font-light gap-3 p-4 grid-cols-2">
                    {menu.items?.map((item) => (
                      <NavigationMenuItem 
                        key={item.name}
                        className="select-none rounded-md transition-colors"
                      >
                        <NavigationMenuLink asChild>
                          <Link 
                            className="p-3 space-y-1 block text-sm leading-none no-underline outline-none"
                            to={item.to}
                          >
                            <span className="text-sm font-medium leading-none">{item.name}</span>
                            <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <Link className={navigationMenuTriggerStyle()} to={menu.to}> {menu.name} </Link>
            )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      </div>

      {/* 중앙 타이틀 */}
      <div className="flex-1 flex justify-center">
        <Link to="/" className="text-2xl font-bold">LE:MORE</Link>
      </div>

      {/* 오른쪽 (필요시 아이콘/버튼) */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {/* 예: <CartIcon />, <UserIcon /> 등 */}
        
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full p-2 flex items-center space-x-2 bg-transparent"
          >
            <MapPin className="w-5 h-5 mr-1" />
            <span className="font-semibold text-sm mr-0">
              {location}
            </span>
            <ChevronDown className="w-4 h-4 ml-0" />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent>
          {LOCATIONS.map((city) => (
            <DropdownMenuItem key={city} onClick={() => updateLocation(city)}>
              {city}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

        {isLoggedIn ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex cursor-pointer relative"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <BellIcon className="size-4" />
              {hasNotifications && (
                <div className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
              )}
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden md:flex cursor-pointer relative">
              <Link to="/my/messages">
                <MessageCircleIcon className="size-4" />
                {hasMessages && (
                  <div className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
                )}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
                  {avatarUrl ? (
                  <AvatarImage src={avatarUrl} /> 
                  ) : (
                  <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{username}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/dashboard">
                      <BarChart3Icon className="size-4 mr-2" />Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/profile">
                      <UserIcon className="size-4 mr-2" />Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/likes">
                      <HeartIcon className="size-4 mr-2" />Likes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/settings">
                      <SettingsIcon className="size-4 mr-2" />Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer md:hidden"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <BellIcon className="size-4 mr-2" />Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                    <Link to="/my/messages">
                      <MessageCircleIcon className="size-4 mr-2" />Messages
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/auth/logout">
                    <LogOutIcon className="size-4 mr-2" />Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary">
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/auth/join">Join</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Notifications Sidebar */}
      <NotificationsPage 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </nav>
  );
}
