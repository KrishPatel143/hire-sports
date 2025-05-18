import { CheckCircle, Heart, Leaf, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <section className="py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About SportsGear</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Founded in 2018, SportsGear has been at the forefront of providing high-quality sportswear that combines
              performance, comfort, and style. Our journey began with a simple mission: to create sportswear that
              empowers athletes of all levels to perform at their best.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Today, we're proud to serve customers worldwide, offering a wide range of products designed for various
              sports and activities. Our commitment to quality, innovation, and customer satisfaction remains at the
              heart of everything we do.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://media.istockphoto.com/id/1136317339/photo/sports-equipment-on-floor.jpg?s=612x612&w=0&k=20&c=-aI8u_Se89IC-HJZYH724ei5z-bIcSvRW6qUwyMtRyE="
              alt="SportsGear Team"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Mission and values */}
      <section className="py-12 md:py-24 bg-gray-50 dark:bg-gray-900 rounded-xl my-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission & Values</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            At SportsGear, we're guided by a set of core values that define who we are and how we operate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We're committed to crafting products of the highest quality, using premium materials and innovative
              technologies.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Passion</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We're passionate about sports and believe in the power of physical activity to transform lives and build
              communities.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <Leaf size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Sustainability</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We're committed to reducing our environmental footprint by using eco-friendly materials and sustainable
              practices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="mb-4 text-primary">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We believe in building and supporting communities through sports and active lifestyles.
            </p>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              SportsGear began with a group of athletes who were frustrated with the sportswear options available in the
              market. We wanted gear that wasn't just functional, but also stylish and built to last.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our founder, Jane Smith, a former professional athlete, assembled a team of designers, engineers, and
              material specialists to create sportswear that addressed the needs of athletes at all levels.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              What started as a small operation has grown into a global brand, but our commitment to quality,
              innovation, and customer satisfaction remains unchanged.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="https://media.istockphoto.com/id/1321017606/photo/multicolored-sport-sleeveless-t-shirts-and-shirts.jpg?s=612x612&w=0&k=20&c=NddwChiHYyB2Swr3emp94PiSGHV2RQXzghkmmj3KkWo="
              alt="SportsGear Journey"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Team section */}
      <section className="py-12 md:py-24 bg-gray-50 dark:bg-gray-900 rounded-xl my-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            The passionate individuals behind SportsGear who work tirelessly to bring you the best products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Jane Smith", role: "Founder & CEO", image: "https://static.wikia.nocookie.net/mr-and-mrs-smith/images/9/9d/Jane_Smith_Infobox.jpg" },
            {
              name: "Michael Johnson",
              role: "Head of Design",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Johnson%2C_Michael_D.jpg/250px-Johnson%2C_Michael_D.jpg",
            },
            { name: "Sarah Lee", role: "Product Manager", image: "https://upload.wikimedia.org/wikipedia/en/6/65/Sara_Lee_2015.jpg" },
            {
              name: "David Chen",
              role: "Head of Technology",
              image: "https://www.kellogg.northwestern.edu/-/media/images/web2022/people/d/david-chen/david-chen-smith-kellogg-faculty-874x728.ashx",
            },
          ].map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
              <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "SportsGear products have significantly improved my performance. The quality and comfort are unmatched!",
              author: "Alex T., Marathon Runner",
            },
            {
              quote:
                "I've tried many sportswear brands, but SportsGear stands out for its durability and style. Highly recommend!",
              author: "Samantha K., Yoga Instructor",
            },
            {
              quote:
                "The customer service at SportsGear is exceptional. They went above and beyond to help me find the perfect gear.",
              author: "Marcus L., Basketball Coach",
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="text-xl italic mb-4">"{testimonial.quote}"</div>
              <div className="text-right font-medium">— {testimonial.author}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

