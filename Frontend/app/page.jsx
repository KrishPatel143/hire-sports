"use client"
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, Tag, ThumbsUp } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  Discover Your Perfect Style
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  High-quality sportswear designed for comfort, performance, and style. 
                  Shop our latest collections today.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <a href="/products">
                  <button size="lg" className="gap-1.5 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
                <a href="/about">
                  <button variant="outline" size="lg" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8">
                    Learn More
                  </button>
                </a>
              </div>
            </div>
            <div className="relative lg:ml-auto flex items-center justify-center">
              <img
                src="https://media.istockphoto.com/id/1321017606/photo/multicolored-sport-sleeveless-t-shirts-and-shirts.jpg?s=612x612&w=0&k=20&c=NddwChiHYyB2Swr3emp94PiSGHV2RQXzghkmmj3KkWo="
                alt="Hero Image"
                width={550}
                height={550}
                className="rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Products</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Check out our most popular items and new arrivals.
              </p>
            </div>
          </div>
          <FeaturedProducts />
          <div className="flex justify-center mt-8">
            <a href="/products">
              <button size="lg" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">View All Products</button>
            </a>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Us</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                We're committed to providing the best experience for our customers.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            <div className="flex flex-col items-center space-y-2 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Quality Products</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Made with premium materials for durability and comfort.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Fast Shipping</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Get your orders quickly with our expedited delivery.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full">
                <ThumbsUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Customer Satisfaction</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Dedicated support team ready to assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog preview */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest From Our Blog</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Read our latest articles and stay updated with sportswear trends.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {[1, 2, 3].map((i) => (
              <a href="/blog/post-1" key={i} className="group">
                <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                  <img
                    src={`/placeholder.svg?height=200&width=400&text=Blog+Post+${i}`}
                    alt={`Blog post ${i}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {i === 1 && "Best Workout Clothes for Summer"}
                      {i === 2 && "How to Choose the Right Running Shoes"}
                      {i === 3 && "5 Tips for Athletic Recovery"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {i === 1 && "Stay cool and comfortable with our top picks for summer workouts."}
                      {i === 2 && "Find the perfect running shoes for your stride and terrain."}
                      {i === 3 && "Maximize your recovery with these expert tips."}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>March 1{i}, 2024</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <a href="/blog">
              <button variant="outline" size="lg" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8">View All Articles</button>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Subscribe to Our Newsletter
              </h2>
              <p className="max-w-[600px] text-primary-foreground md:text-xl/relaxed">
                Get the latest updates, promotions, and exclusive offers.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <form className="flex space-x-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                  placeholder="Enter your email"
                  type="email"
                  required
                />
                <button type="submit" variant="secondary" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Don't forget to import this component
function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Retrieve token from local storage or your authentication mechanism
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
  }, [])

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      if (!token) return

      try {
        const response = await fetch(`${process.env.API_BASE_URL}/products?featured=true`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch featured products')
        }

        const data = await response.json()
        setProducts(data.products.slice(0, 4)) // Limit to 4 products
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching featured products:', error)
        setIsLoading(false)
      }
    }

    if (token) {
      fetchFeaturedProducts()
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-60 bg-gray-300 rounded-t-lg"></div>
            <div className="p-5">
              <div className="h-4 bg-gray-300 mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-300 mb-2 w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 w-1/4"></div>
                <div className="h-6 bg-gray-300 w-1/4 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      {products.map((product) => (
        <div 
          key={product._id} 
          className="group relative overflow-hidden rounded-lg border bg-background hover:shadow-lg"
        >
          <img
            src={product.images[0] }
            alt={product.name}
            className="h-60 w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="p-5">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold">${product.price.toFixed(2)}</span>
              <button className="rounded-md bg-primary px-3 py-1 text-xs text-white">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Home;