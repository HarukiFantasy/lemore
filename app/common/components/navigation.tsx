import { Link } from 'react-router';
import { Separator } from './ui/separator';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from './ui/navigation-menu';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BarChart3Icon, BellIcon, LogOutIcon, MessageCircleIcon, SettingsIcon, UserIcon } from 'lucide-react';

const menus = [
  {
    name: 'Secondhand',
    to: '/secondhand',
    items: [
      {
        name: 'Submit a Listing',
        description: 'Sell your stuff. Make some cash',
        to: '/submit-a-listing',
      },
      {
        name: 'Browse Listings',
        description: 'Find great deals on used items',
        to: '/browse-listings',
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
        to: '/local-tips',
      },
      {
        name: 'Ask & Answer',
        description: 'Ask and answer questions',
        to: '/ask-and-answer',
      },
      {
        name: 'Local Reviews ',
        description: 'Share your local reviews',
        to: '/local-reviews',
      },
      {
        name: 'Give & Glow',
        description: 'One-line notes from your giving moments',
        to: '/give-and-glow',
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
}: {
  isLoggedIn: boolean;
  hasNotifications: boolean;
  hasMessages: boolean;
}) {
  return (
    <nav className="flex px-20 h-16 items-center justify-between backdrop-blur fixed top-0 left-0 right-0 z-50 bg-background/50">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight">Lemore</Link>
        <Separator orientation="vertical" className="h-6 mx-4" />
        <NavigationMenu>
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
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="cursor-pointer relative">
            <Link to="/my/notifications">
              <BellIcon className="size-4" />
              {hasNotifications && (
                <div className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="cursor-pointer relative">
            <Link to="/my/messages">
              <MessageCircleIcon className="size-4" />
              {hasMessages && (
                <div className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
              )}
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="https://github.com/harukifantasy.png" />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">Haruki</span>
                <span className="text-xs text-muted-foreground">@username</span>
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
                  <Link to="/my/settings">
                    <SettingsIcon className="size-4 mr-2" />Settings
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
        </div>
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
    </nav>
  );
}