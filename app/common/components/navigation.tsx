import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
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
    
    if (newLocation === "All Locations" || newLocation === "All Cities") {
      // All Locations 또는 All Cities를 선택하면 location 파라미터를 제거
      params.delete("location");
    } else {
      params.set("location", newLocation);
    }
    
    setSearchParams(params);
  };

  useEffect(() => {
    const urlLocation = searchParams.get("location");
    if (urlLocation && urlLocation !== location) {
      setLocation(urlLocation);
    }
  }, [searchParams, location]);

  return (
    <nav className="flex items-center justify-between px-4 sm:px-5 h-14 sm:h-16 bg-primary fixed top-0 left-0 right-0 z-50">
      {/* 왼쪽 메뉴 */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* 모바일 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="md:hidden">
              <button className="text-xl sm:text-2xl cursor-pointer p-1">
                <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
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
            {/* 모바일에서만 보이는 Join 버튼 */}
            {!isLoggedIn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/auth/join" className="block w-full">
                    <UserIcon className="w-4 h-4 mr-2 inline" />
                    Join
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 데스크톱 네비게이션 메뉴 */}
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
      <div className="flex justify-center min-w-0">
        <Link to="/" className="text-lg sm:text-xl md:text-2xl font-bold truncate">
          LE:MORE
        </Link>
      </div>

      {/* 오른쪽 (위치선택, 알림, 프로필) */}
      <div className="flex justify-end items-center gap-1 sm:gap-2 md:gap-4 min-w-0">
        {/* 위치 선택 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full p-1 sm:p-2 flex items-center space-x-1 bg-transparent min-w-0"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm truncate max-w-16 sm:max-w-20">
                {location}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => updateLocation("All Cities")}>
              All Cities
            </DropdownMenuItem>
            {LOCATIONS.map((city) => (
              <DropdownMenuItem key={city} onClick={() => updateLocation(city)}>
                {city}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isLoggedIn ? (
          <>
            {/* 데스크톱 알림 버튼 */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex cursor-pointer relative p-2"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <BellIcon className="w-4 h-4" />
              {hasNotifications && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
            
            {/* 데스크톱 메시지 버튼 */}
            <Button variant="ghost" size="icon" asChild className="hidden md:flex cursor-pointer relative p-2">
              <Link to="/my/messages"> 
                <MessageCircleIcon className="w-4 h-4" />
                {hasMessages && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            </Button>

            {/* 프로필 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full cursor-pointer overflow-hidden flex-shrink-0">
                  {avatarUrl && avatarUrl.trim() !== '' ? (
                    <img 
                      src={avatarUrl} 
                      alt={username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base md:text-lg ${avatarUrl && avatarUrl.trim() !== '' ? 'hidden' : ''}`}>
                    {username && username.trim() !== '' ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium truncate">{username}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/dashboard">
                      <BarChart3Icon className="w-4 h-4 mr-2" />Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/profile">
                      <UserIcon className="w-4 h-4 mr-2" />Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my/likes">
                      <HeartIcon className="w-4 h-4 mr-2" />Likes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer md:hidden"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    <BellIcon className="w-4 h-4 mr-2" />
                    Notifications
                    {hasNotifications && (
                      <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                    <Link to="/my/messages">
                      <MessageCircleIcon className="w-4 h-4 mr-2" />
                      Messages
                      {hasMessages && (
                        <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/auth/logout">
                    <LogOutIcon className="w-4 h-4 mr-2" />Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="text-xs sm:text-sm px-3 py-1.5">
              <Link to="/auth/login">Login</Link>
            </Button>
            {/* 데스크톱에서만 보이는 Join 버튼 */}
            <Button asChild variant="secondary" size="sm" className="hidden md:flex text-xs sm:text-sm px-3 py-1.5">
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
