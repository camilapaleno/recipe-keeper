import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import GrocerySelect from "@/pages/grocery-select";
import GroceryList from "@/pages/grocery-list";
import NotFound from "@/pages/not-found";

// Matches vite's `base` ("/recipe-keeper/") so routes work in dev and on GitHub Pages
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function Router() {
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/grocery" component={GrocerySelect} />
        <Route path="/grocery/list" component={GroceryList} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
