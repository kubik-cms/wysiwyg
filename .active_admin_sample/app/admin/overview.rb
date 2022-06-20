ActiveAdmin.register_page "Tables" do
  breadcrumb do
    [link_to('Admin', admin_root_path)]
  end
  content do
    panel 'Panel header' do
      table_for NewsArticle.all, class: 'kubik_table' do
        column(:title)
        column 'Main header', :header
        column 'Published at', :published_at
        column('Featured') { |article| status_tag article.featured }
      end
      columns do
        column do
          panel 'Column 1 panel - kubik_table' do
            table_for NewsArticle.all, class: 'kubik_table kubik_table--zebra' do
              column(:title)
              column 'Main header', :header
              column 'Published at', :published_at
              column('Featured') { |article| status_tag article.featured }
            end
          end
        end
        column do
          panel 'Column 2 panel' do
            table_for NewsArticle.all, class: 'kubik_table' do
              column(:title)
              column 'Main header', :header
              column 'Published at', :published_at
              column('Featured') { |article| status_tag article.featured }
            end
          end
        end
      end
    end
  end
end
