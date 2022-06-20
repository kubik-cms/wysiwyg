# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
AdminUser.create!(email: 'admin@example.com', password: 'password', password_confirmation: 'password') if Rails.env.development?

NewsArticle.create([
  {
    title: 'Dolore dolorem fugit',
    header: 'Dolore dolorem fugit',
    content: 'Qui adipisci illo dolor aliquid dolores repellendus.',
    published_at: DateTime.now,
    category: 'blog',
    featured: true
  },
  {
    title: 'Reprehenderit harum hic',
    header: 'Reprehenderit harum hic',
    content: 'Voluptatem aliquid sapiente.',
    published_at: DateTime.now - 1.days,
    category: 'press_release',
    featured: true
  },
  {
    title: 'Totam sunt temporibus',
    header: 'Totam sunt temporibus',
    content: 'Voluptates nihil reprehenderit voluptas doloremque dicta quidem reiciendis.',
    published_at: DateTime.now - 1.months,
    category: 'press_release',
    featured: true
  },
  {
    title: 'Sunt quia quas',
    header: 'Sunt quia quas',
    content: 'Laborum tenetur cupiditate fuga.',
    published_at: nil,
    category: 'blog',
    featured: true
  },
  {
    title: 'Aut deleniti nulla',
    header: 'Aut deleniti nulla',
    content: 'Non beatae placeat sed ratione.',
    published_at: DateTime.now - 4.days,
    featured: true
  }
])

BookAuthor.create([
  {
    name: 'Bret Pacocha',
    bio: 'Voluptas similique asperiores numquam assumenda hic rerum aliquam explicabo ipsam. Rerum omnis rerum dolorem necessitatibus vel voluptates accusamus consequatur magnam. Dolore nemo quas iusto praesentium reiciendis et.'
  },
  {
    name: 'Ivory Gusikowski',
    bio: 'Quasi quisquam vero facere recusandae. Quo repudiandae voluptatem. Labore est qui vel maiores architecto.'
  },
  {
    name: 'Armand Schmidt',
    bio: 'Voluptatem quis doloribus repellendus. Officia repudiandae qui odit et ut veritatis. Est fugiat porro hic. Corporis occaecati et dicta rerum doloremque et omnis qui rem. Fuga minima distinctio. Natus autem consequatur ratione eius fugiat ea blanditiis temporibus.'
  },
  {
    name: 'Randi Becker',
    bio: 'Et voluptate eligendi molestiae voluptate eligendi sed excepturi a expedita. Et occaecati autem quisquam molestiae nam est et quos amet. Ea vel voluptatem at impedit. Facere deserunt dolore veniam tenetur aut iure impedit fugiat ut. Repudiandae blanditiis voluptatem libero non odio. Animi praesentium nihil rem dolores ut omnis dolore odio quae.'
  },
  {
    name: 'Dulce Huels',
    bio: 'Illum dolores nisi excepturi sint quaerat quia ut inventore. Excepturi dolores quia impedit et velit. Eius commodi a dolor et quaerat dicta. Et omnis sit est et aut quae sit impedit.'
  }
])

book_author_ids = BookAuthor.pluck(:id)

Book.create([
  {
    title: 'Enter the Midnight Hour',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'Outturn the Storm',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'Strange Point',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'The Bones of the Cursed',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'Thief of Iron',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'The Crystal in the Stars',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'Rogue\'s Heir',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'The Freaky Portrait',
    book_author: BookAuthor.find(book_author_ids.sample)
  },
  {
    title: 'Secret of the Vanishing Stranger',
    book_author: BookAuthor.find(book_author_ids.sample)
  }
])
