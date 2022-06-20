ActiveAdmin.register NewsArticle do
  permit_params :title, :header, :category, :content, :featured, :published_at

  config.per_page = 3

  scope('All', &:all)
  scope('Blog') { |scope| scope.where(category: 'blog') }
  scope('Press Release') { |scope| scope.where(category: 'press_release') }

  form do |f|
    tabs do
      tab 'Basic' do
        f.inputs do
          f.input :title
          f.input :header
          f.input :category
          f.input :content
        end
      end
      tab 'Advanced' do
        f.inputs do
          f.input :featured
          f.input :published_at
          f.input :published_at, as: :datepicker
        end
      end
    end
    f.actions
  end

  show do
    tabs do
      tab 'Basic' do
        attributes_table_for news_article do
          row :title
          row :header
          row :category
          row :content
        end
      end
      tab 'Advanced' do
        attributes_table_for news_article do
          row :featured, class: 'kubik-compact-column kubik-compact-column__status' do |a|
            status_tag news_article.featured
          end
          row :published_at
        end
      end
    end
  end
end
